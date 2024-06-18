import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
import math
import tensorflow as tf

# Fungsi Haversine untuk menghitung jarak
def haversine(lon1, lat1, lon2, lat2):
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371
    return c * r

# Fungsi kustom MSE
@tf.keras.utils.register_keras_serializable()
def mse(y_true, y_pred):
    return tf.reduce_mean(tf.square(y_pred - y_true), axis=-1)

def find_nearest_express_places(data, user_location, model_path):
    # Memuat model
    model = load_model(model_path, custom_objects={'mse': mse})

    # Menambahkan fitur jarak ke lokasi pengguna
    data['Distance'] = data.apply(lambda row: haversine(user_location[1], user_location[0], row['Longitude'], row['Latitude']), axis=1)

    # Menyusun tempat berdasarkan jarak
    recommended_places = data.sort_values(by=['Distance'], ascending=True)

    # Membatasi hasil menjadi 10 tempat terdekat
    top_10_places = recommended_places.head(10)

    return top_10_places
