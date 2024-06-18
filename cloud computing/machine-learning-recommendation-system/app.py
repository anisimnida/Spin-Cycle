from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from services.near_services import find_nearest_places  # Import find_nearest_places function
from services.selfservice_services import find_nearest_self_service_places  # Import find_nearest_self_service_places function
from services.express_services import find_nearest_express_places
from services.service import recommendation_system

app = Flask(__name__)

laundry_data = pd.read_csv('data/laundry.csv')

@app.route('/laundries', methods=['GET'])
def get_all_laundries():
    result = laundry_data.to_dict(orient='records')
    return jsonify(result)

@app.route('/laundries/<int:id>', methods=['GET'])
def get_laundry_detail(id):
    if id < 0 or id >= len(laundry_data):
        return jsonify({"error": "Laundry not found"}), 404
    result = laundry_data.iloc[id].to_dict()
    return jsonify(result)

@app.route('/recommend/service', methods=['POST'])
def recommend_service():
    data = request.json
    user_location = np.array(data['user_location'])
    selected_service = data['selected_service']

    if selected_service not in laundry_data.columns:
        return jsonify({"error": f"Service '{selected_service}' not found"}), 400

    model = load_model('models/model_service.h5')
    recommended_places = recommendation_system(user_location[0], user_location[1], selected_service, laundry_data, model)
    result = recommended_places.to_dict(orient='records')

    return jsonify(result)

@app.route('/recommend/express', methods=['POST'])
def recommend_express():
    data = request.json
    user_location = np.array(data['user_location'])
    laundry_data = pd.read_csv('data/laundry.csv')  # Assuming the express service data is in CSV

    nearest_places = find_nearest_express_places(laundry_data, user_location, 'models/model_Express.h5')
    result = nearest_places.to_dict(orient='records')

    return jsonify(result)

@app.route('/recommend/self-service', methods=['POST'])
def recommend_self_service():
    data = request.json
    user_location = np.array(data['user_location'])
    self_service = pd.read_csv('data/laundry.csv')  # Assuming the self-service data is in CSV

    nearest_places = find_nearest_self_service_places(self_service, user_location, 'models/model_SelfService.h5')
    result = nearest_places.to_dict(orient='records')

    return jsonify(result)

@app.route('/recommend/near', methods=['POST'])
def recommend_near():
    data = request.json
    user_location = np.array(data['user_location'])
    laundry = pd.read_csv('data/laundry.csv')  # Assuming the laundry data is in CSV

    nearest_places = find_nearest_places(laundry, user_location, 'models/model_Near.h5')
    result = nearest_places.to_dict(orient='records')

    return jsonify(result)

@app.route('/', methods=['GET'])
def index():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
