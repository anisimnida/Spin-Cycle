import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
import math
import tensorflow as tf

# Fungsi Haversine
def haversine(lon1, lat1, lon2, lat2):
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371
    return c * r

# Fungsi MSE
def mse(y_true, y_pred):
    return tf.reduce_mean(tf.square(y_true - y_pred))

def find_nearest_self_service_places(self_service_df, user_location, model_path):
    model = load_model(model_path, custom_objects={'mse': mse})

    # Menghitung jarak dari lokasi pengguna ke setiap tempat
    self_service_df.loc[:, 'Distance'] = self_service_df.apply(lambda row: haversine(user_location[1], user_location[0], row['Longitude'], row['Latitude']), axis=1)

    # Menyusun tempat berdasarkan prediksi rating dan jarak
    recommended_places = self_service_df.sort_values(by=['Distance'], ascending=[True])

    # Membatasi hasil menjadi 10 tempat terdekat
    top_10_places = recommended_places.head(10)

    return top_10_places
