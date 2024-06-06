# -*- coding: utf-8 -*-
"""searchbar.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1WAOtMTFB7d7U0ix4biXumiTmWaWu1783
"""

from flask import Flask, request, jsonify
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

# Load data CSV
data = pd.read_csv('https://raw.githubusercontent.com/anisimnida/Spin-Cycle/main/machine-learning/cleaned%20data/laundry.csv')

# Preprocessing teks
data['Name'] = data['Name'].str.lower()
data['Fulladdress'] = data['Fulladdress'].str.lower()
data['Categories'] = data['Categories'].str.lower()
data['Layanan'] = data['Layanan'].str.lower()

# Gabungkan kolom teks yang relevan untuk pencarian
data['Description'] = data['Name'] + ' ' + data['Fulladdress'] + ' ' + data['Categories'] + ' ' + data['Layanan']
data['Description'].fillna('', inplace=True)

# Inisialisasi TF-IDF Vectorizer
tfidf_vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf_vectorizer.fit_transform(data['Description'])

# Fungsi pencarian berbasis teks
def cari_tempat_laundry(keyword):
    # Transform kata kunci menjadi vektor TF-IDF
    keyword_vec = tfidf_vectorizer.transform([keyword.lower()])

    # Hitung similaritas kosinus antara keyword_vec dan semua dokumen
    similarities = cosine_similarity(keyword_vec, tfidf_matrix).flatten()

    # Dapatkan indeks urutan similaritas tertinggi
    index_sorted = similarities.argsort()[::-1]

    # Ambil data tempat laundry yang paling relevan
    hasil_pencarian = data.iloc[index_sorted]

    return hasil_pencarian

# API endpoint untuk pencarian
@app.route('/search', methods=['GET'])
def search():
    keyword = request.args.get('keyword')
    hasil = cari_tempat_laundry(keyword)
    hasil_json = hasil[['Name', 'Fulladdress', 'phone', 'Average Rating', 'Google Maps URL', 'Website', 'Opening Hours', 'Featured Image', 'Layanan']].to_dict(orient='records')
    return jsonify(hasil_json)

if __name__ == '__main__':
    app.run(debug=True)