from flask import Flask, jsonify, request
from predict import predict

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/predict', methods=['POST'])
def predict_route():
    data = request.get_json() or {}
    text = data.get('text', '')
    return jsonify(predict(text))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
