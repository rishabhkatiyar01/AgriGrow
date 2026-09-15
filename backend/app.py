import sys
import os
import io

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from flask import Flask, request, jsonify
from flask_cors import CORS
from cnn_model import run_cnn_inference, DISEASE_CLASSES, model

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for React frontend

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify backend status."""
    return jsonify({
        "status": "online",
        "service": "AgriGrow Plant Disease Detection CNN API",
        "modelLoaded": model is not None,
        "supportedClasses": len(DISEASE_CLASSES)
    }), 200

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Accepts crop leaf image upload (multipart/form-data)
    and returns CNN disease classification result.
    """
    if 'file' not in request.files and 'image' not in request.files:
        return jsonify({
            "error": "No image file provided. Please attach an image file under key 'file' or 'image'."
        }), 400
        
    file = request.files.get('file') or request.files.get('image')
    
    if file.filename == '':
        return jsonify({"error": "No file selected."}), 400
        
    try:
        image_bytes = file.read()
        if len(image_bytes) == 0:
            return jsonify({"error": "Uploaded image file is empty."}), 400

        # Perform CNN classification inference
        result = run_cnn_inference(image_bytes)
        
        return jsonify({
            "success": True,
            "data": result
        }), 200
        
    except Exception as e:
        print(f"Prediction Error: {str(e)}")
        return jsonify({
            "error": f"Failed to process image with CNN model: {str(e)}"
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"AgriGrow CNN Disease Detection API running on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
