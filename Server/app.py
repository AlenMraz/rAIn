from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS

import os
from PIL import Image
from torch import nn
from torchvision.transforms import ToTensor
import torch
from image_canny import to_canny_new
from prometheus_client import start_http_server, Counter
from prometheus_client import Gauge
import numpy as np

#temp
#import matplotlib.pyplot as plt

class RainIdentifier(nn.Module):
    def __init__(self):
        super(RainIdentifier, self).__init__()
        self.model = nn.Sequential(
            nn.Conv2d(1, 32 , (3,3), padding=1),
            nn.BatchNorm2d(32),
            nn.MaxPool2d((2,2)),       
            nn.ReLU(),
            nn.Conv2d(32, 64 , (3,3), padding=1),
            nn.BatchNorm2d(64),
            nn.MaxPool2d((2,2)),
            nn.ReLU(),
            nn.Conv2d(64, 64 , (3,3), padding=1),
            nn.BatchNorm2d(64),
            nn.MaxPool2d((2,2)),
            nn.ReLU(),
            nn.Dropout(0.25),
            nn.Flatten(),
            nn.Linear(64 * 60 * 60, 4)
        )
    def forward(self, x):
        return self.model(x)



RAINSTATUS = Gauge('rain_status', 'Rain status')
CHANGES = Counter('changes', 'Changes')
HEAVY_RAIN = Counter('heavy_rain', 'Heavy rain')
last_detection = "not"
# start_http_server(5000)
app = Flask(__name__)
classes = {0:'not', 1:'drizzle', 2:'mid', 3:'high'}
clf = RainIdentifier().to('cpu')
clf.load_state_dict(torch.load('model.pth', map_location=torch.device('cpu')))

clf.eval()
CORS(app)
print("Model loaded successfully!")


UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/upload', methods=['POST'])
def upload_image():
    
    if 'image' not in request.files:
        
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({"error": "No file selected for uploading"}), 400

    if file and allowed_file(file.filename):
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)
        

        try:
            #TODO: decompress image
            
            image = Image.open(filepath) 
            img_canny = to_canny_new(np.array(image))
            #plt.imshow(img_canny)
            #plt.show()
            
            
            img_tensor = ToTensor()(img_canny).unsqueeze(0)
            
            output = torch.argmax(clf(img_tensor))
            
            message = f"Image evaluated successfully! Classification: {classes[output.item()]}"
            
            print("Klasifikacija slike: ",classes[output.item()])
            
            classification = classes[output.item()]
            if classification != last_detection:
                CHANGES.inc(1)
                last_detection = classification
                
            RAINSTATUS.set(classification)
            if classification == "high":
                HEAVY_RAIN.inc(1)
        except Exception as e:
            message = f"Image uploaded, but an error occurred during processing: {str(e)}"

        return jsonify({"message": message, "classification": classification}), 200
    else:
        return jsonify({"error": "Allowed file types are jpg, jpeg, png, gif"}), 400

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
def crop_center(image_path, crop_width, crop_height):
    img = Image.open(image_path)

    width, height = img.size

    left = (width - crop_width) // 2
    top = (height - crop_height) // 2
    right = left + crop_width
    bottom = top + crop_height

    cropped_img = img.crop((left, top, right, bottom))
    return cropped_img

if __name__ == '__main__':
    app.run(debug=True)
