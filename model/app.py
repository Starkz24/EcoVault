from flask import Flask, request
from flask_cors import CORS
from PIL import Image
import numpy as np
import tf_keras
from tf_keras.applications.mobilenet_v2 import preprocess_input
import json

class_names = ["Cardboard", "Glass", "Metal", "Paper", "Plastic", "Trash"]

app = Flask(__name__)
CORS(app)

model = tf_keras.models.load_model("./keras_model.h5", compile=False)

@app.route("/")
def root():
    with open("index.html") as file:
        return file.read()

@app.route("/detect", methods=["POST"])
def detect():
    buf = request.files["image_file"]
    image = Image.open(buf.stream)

    boxes = detect_objects_on_image(image)
    json_boxes = json.dumps(boxes)
    print(json_boxes)
    return json_boxes

def detect_objects_on_image(image):
    input_shape = model.input_shape[1:3]
    resized_image = image.convert("RGB").resize(input_shape)
    input_data = np.expand_dims(preprocess_input(np.array(resized_image, dtype=np.float32)), axis=0)

    predictions = model.predict(input_data)

    boxes = []
    for prediction in predictions:
        class_id = int(np.argmax(prediction))
        object_type = class_names[class_id]
        boxes.append(object_type)

    return boxes

if __name__ == '__main__':
    app.run(port=4000, debug=True)
