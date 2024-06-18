import math
import pandas as pd
from tensorflow.keras.models import load_model
from tensorflow.keras import backend as K

# Fungsi Haversine
def haversine(lon1, lat1, lon2, lat2):
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1  # Perubahan ini, sebelumnya lat2 - lat2
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371  # Radius of Earth in kilometers
    return c * r

# Metrik kustom
def mse(y_true, y_pred):
    return K.mean(K.square(y_pred - y_true), axis=-1)

# Fungsi untuk mencari tempat terdekat
def find_nearest_places(laundry, user_location, model_path):
    model = load_model(model_path, custom_objects={'mse': mse})

    # Menghitung jarak dari lokasi pengguna ke setiap tempat
    laundry['Distance'] = laundry.apply(lambda row: haversine(user_location[1], user_location[0], row['Longitude'], row['Latitude']), axis=1)

    # Menggunakan model untuk mendapatkan prediksi rating berdasarkan lokasi pengguna
    predicted_ratings = model.predict({
        'latitude': laundry['Latitude'].values,
        'longitude': laundry['Longitude'].values,
        'distance': laundry['Distance'].values
    })

    # Menambahkan prediksi rating ke dataframe
    laundry['Predicted_Rating'] = predicted_ratings

    # Menyusun tempat berdasarkan prediksi rating dan jarak
    recommended_places = laundry.sort_values(by=['Distance', 'Predicted_Rating'], ascending=[True, False])

    # Membatasi hasil menjadi 10 tempat terdekat
    top_10_places = recommended_places.head(10)

    return top_10_places
