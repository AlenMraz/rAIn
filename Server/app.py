from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import os
from PIL import Image

app = Flask(__name__)

# Enable CORS for the entire app
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
            # Process the image using Pillow
            with Image.open(filepath) as img:
                width, height = img.size

            message = f"Image uploaded successfully! Dimensions: {width}x{height}"
        except Exception as e:
            message = f"Image uploaded, but an error occurred during processing: {str(e)}"

        return jsonify({"message": message})
    else:
        return jsonify({"error": "Allowed file types are jpg, jpeg, png, gif"}), 400

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

if __name__ == '__main__':
    app.run(debug=True)
