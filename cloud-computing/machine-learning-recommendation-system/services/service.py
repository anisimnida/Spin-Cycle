import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0  # Radius Bumi dalam kilometer
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat / 2) ** 2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2) ** 2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    distance = R * c
    return distance

def recommendation_system(user_latitude, user_longitude, selected_service, places, model):
    # Split layanan menjadi kolom dengan one-hot encoding
    services = places['Layanan'].str.get_dummies(sep=', ')
    places = pd.concat([places, services], axis=1)

    # Periksa apakah kolom selected_service ada di DataFrame
    if selected_service not in places.columns:
        raise ValueError(f"Layanan '{selected_service}' tidak ditemukan dalam data.")
    
    # Filter data berdasarkan layanan yang dipilih
    filtered_places = places[places[selected_service] == 1]

    # Hitung jarak dari pengguna ke tempat-tempat yang dipilih
    filtered_places['distance'] = filtered_places.apply(lambda row: haversine(user_latitude, user_longitude, row['Latitude'], row['Longitude']), axis=1)

    # Menyiapkan data untuk prediksi
    X = filtered_places[['distance']].values

    # Melakukan prediksi
    predictions = model.predict(X)

    # Menambahkan kolom prediksi ke DataFrame
    filtered_places['predicted_prob'] = predictions

    # Mengurutkan tempat berdasarkan probabilitas prediksi
    filtered_places = filtered_places.sort_values(by='distance')
    filtered_places = filtered_places.head(30)

    return filtered_places[['Name', 'Fulladdress', 'phone', 'Average Rating', 'Google Maps URL', 'Website', 'Opening Hours', 'Featured Image', 'Layanan', 'distance']]
