# -*- coding: utf-8 -*-
"""Recommendation_Model_Express.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1tcwNOT2OYCi4AEdm9SUp6p7D2a6oBOBD
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, Concatenate, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from geopy.distance import geodesic
from sklearn.metrics import mean_absolute_error, mean_squared_error
import matplotlib.pyplot as plt
import seaborn as sns
from keras.models import load_model
import math
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.layers import Input, Dense, Concatenate, Normalization

# Gathering Data
data = pd.read_csv('https://raw.githubusercontent.com/anisimnida/Spin-Cycle/main/machine-learning/cleaned%20data/laundry.csv')
data

data.isna().sum()

data = data.fillna('None')
data.isna().sum()

# keyword untuk 'express'
keyword = 'pres'

# memfilter laundry yang melayani laundry 'express'
data_express = data[data['Name'].str.contains(keyword, na=False)]

# print hasil
print('Data Laundry Expresss: ')
data_express

"""Model Tensorflow: Laundry Express"""

def prepare_data(data_express, user_location):
    # menambahkan fitur jarak ke lokasi pengguna
    data_express['Distance'] = data_express.apply(lambda row: geodesic(user_location, (row['Latitude'], row['Longitude'])).km, axis=1)

    # membuat fitue dan label
    features = data_express[['Latitude', 'Longitude', 'Distance']]
    labels = data_express['Average Rating']

    # split data menjadi train dan test
    X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)

    # normalisasi
    scaler = MinMaxScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    return X_train_scaled, X_test_scaled, y_train, y_test

def build_model():
    # Input layer
    latitude_input = Input(shape=(1,), name='latitude')
    longitude_input = Input(shape=(1,), name='longitude')
    distance_input = Input(shape=(1,), name='distance')

    # Menggabungkan input
    concatenated = Concatenate()([latitude_input, longitude_input, distance_input])

    # Normalize the concatenated inputs
    normalizer = Normalization()
    normalizer.adapt(np.array([[0, 0, 0], [1, 1, 1]]))  # Dummy data to adapt normalizer

    # Membangun model neural network
    x = Dense(256, activation='relu')(concatenated)
    x = Dense(128, activation='relu')(concatenated)
    x = Dense(64, activation='relu')(concatenated)
    x = Dense(32, activation='relu')(x)
    output = Dense(1, activation='linear')(x)

    # Model
    model = Model(inputs=[latitude_input, longitude_input, distance_input], outputs=output)
    model.compile(optimizer='adam', loss='mse')  # Use MSE as the loss function

    return model

def train_model(model, X_train_scaled, X_test_scaled, y_train, y_test):
    # Membuat dataset TensorFlow dengan dua input terpisah
    def split_lat_lon_distance(features, label):
        latitude = features[0]
        longitude = features[1]
        distance = features[2]
        return {'latitude': latitude, 'longitude': longitude, 'distance': distance}, label

    # Membuat dataset dengan map function untuk memisahkan latitude dan longitude
    train_dataset = tf.data.Dataset.from_tensor_slices((X_train_scaled, y_train.values))
    train_dataset = train_dataset.shuffle(buffer_size=len(X_train_scaled)).map(split_lat_lon_distance).batch(32)

    test_dataset = tf.data.Dataset.from_tensor_slices((X_test_scaled, y_test.values))
    test_dataset = test_dataset.map(split_lat_lon_distance).batch(32)

    # Early stopping
    early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

    # Melatih model
    history = model.fit(train_dataset, epochs=200, validation_data=test_dataset, callbacks=[early_stopping])

    # Evaluasi model
    loss = model.evaluate(test_dataset)
    print('Test Loss:', loss)

    # Prediksi
    y_pred = model.predict(test_dataset).flatten()  # Pastikan bentuknya sesuai
    # Menghitung metrik tambahan
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    print('Mean Absolute Error:', mae)
    print('Mean Squared Error:', mse)

    return history

def save_model(model, filename):
    model.save(filename)

def main(data_express, user_location):
    X_train_scaled, X_test_scaled, y_train, y_test = prepare_data(data_express, user_location)
    model = build_model()
    history = train_model(model, X_train_scaled, X_test_scaled, y_train, y_test)
    save_model(model, 'model_Express.h5')
    return model, history

user_location = (-6.266383404321731, 106.92144906171373)
model, history = main(data_express, user_location)

# Load the saved model
model = load_model("model_Express.h5")

# Plot training & validation loss values
plt.figure(figsize=(10, 6))
plt.plot(history.history['loss'], label='train_loss')
plt.plot(history.history['val_loss'], label='val_loss')
plt.title('Model Loss')
plt.ylabel('Loss')
plt.xlabel('Epoch')
plt.legend(loc='upper right')
plt.show()

# Menjalankan Model_Express.h5
# Fungsi Haversine
def haversine(lon1, lat1, lon2, lat2):
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371
    return c * r

def find_nearest_places(data_express, user_location, model_path):
    model = load_model(model_path)

    # Menghitung jarak dari lokasi pengguna ke setiap tempat
    data_express.loc[:, 'Distance'] = data_express.apply(lambda row: haversine(user_location[1], user_location[0], row['Longitude'], row['Latitude']), axis=1)

    # Menyusun tempat berdasarkan prediksi rating dan jarak
    recommended_places = data_express.sort_values(by=['Distance'], ascending=[True])

    # Membatasi hasil menjadi 10 tempat terdekat
    top_10_places = recommended_places.head(10)

    return top_10_places

def print_nearest_places(nearest_places, user_location):
    selected_columns = ['Name', 'Fulladdress', 'Categories', 'phone', 'Average Rating', 'Distance', 'Google Maps URL','Website', 'Opening Hours', 'Layanan']

    # Filter tempat yang berada dalam jarak 500 km
    nearest_places_within_50km = nearest_places[nearest_places['Distance'] <= 50]

    if nearest_places_within_50km.empty:
        print("Tidak ada tempat laundry yang ditemukan")
        return

    for index, row in nearest_places.iterrows():
      print(f"Nama Laundry: {row['Name']}")
      print(f"Alamat Lengkap: {row['Fulladdress']}")
      print(f"Telepon: {row['phone']}")
      print(f"Rating: {row['Average Rating']}")
      print(f"Jarak: {row['Distance']:.2f} km")
      print(f"Google Maps URL: {row['Google Maps URL']}")
      print(f"Website: {row['Website']}")
      print(f"Jam Buka: {row['Opening Hours']}")
      print(f"Layanan: {row['Layanan']}")
      print("\n")

# Contoh penggunaan fungsi
user_location = np.array([-6.266383404321731, 106.92144906171373])
nearest_places_sorted = find_nearest_places(data_express, user_location, "model_Express.h5")
print_nearest_places(nearest_places_sorted, user_location)
