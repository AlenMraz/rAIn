from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import os
from PIL import Image
from torchvision.transforms import ToTensor
import torch
from image_canny import to_canny_new

app = Flask(__name__)
classes = {0:'mid', 1:'high', 2:'not', 3:'drizzle'}
clf = torch.load('model.pth', map_location='cpu')
clf.eval()
CORS(app)

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
            image = to_canny_new(crop_center(Image.open(filepath))) 
            img_tensor = ToTensor()(image).unsqueeze(0)
            output = torch.argmax(clf(img_tensor))
            message = f"Image evaluated successfully! Classification: {classes[output.item()]}"
            classification = classes[output.item()]
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
