# Machine Learning
**Capstone Bangkit 2024**  
Machine Learning Cohorts work scope.

## Meet the Machine Learning Team!

<hr>

|            Name           |  Bangkit ID  |                                 Work Scopes                                           |  
|:-------------------------:|:------------:|:-------------------------------------------------------------------------------------:|
|   Elsa Maulida Pangesti   | M004D4KX2361 | Scrapping the raw data from Google Maps<br>  Creating the model for **searchbar** feature<br>  Creating model for **service** feature |
|       Nur Shofiatun       | M004D4KX1666 | Processing the raw data into a clean dataset<br>  Creating the model for **near** feature<br>  Creating model for **self service** feature |
|      Putri Ayu Desita     | M004D4KX2125 | Processing the raw data into a clean dataset<br>  Creating the model for **express** feature |

## Documentation 
<hr>

<ol>
  <li><strong>Dataset</strong>
    <ol type="a">
      <li><strong>Deskripsi Data :</strong> The data used was obtained from the Kaggle dataset and Google Maps source.</li>
      <li><strong>Data Description :</strong>strong> The dataset consists of attributes such as place name, description, full address, categories, phone, average rating, open hours, etc.</li>
      <li><strong>Preprocessing Data :</strong>strong> Cleaning the data by dealing with missing values and duplicate data, and normalizing the data using Min-Max Scaling (Normalization) and/or Z-Score Standardization (Standardization).</li>
    </ol>
  </li>
  <li><strong>Model</strong>
    <ol type="a">
      <li><strong>Near Feature :</strong> This model uses a Feedforward Neural Network with multiple dense layers that incorporates L2 regularization and dropout to prevent overfitting. It also uses ReLU as the activation function used in each dense layer.</li>
      <li><strong>Search Bar Feature  :</strong> - It uses the TF-IDF algorithm to convert the text into a numerical representation based on the frequency of occurrence of the word adjusted for the importance of the word throughout the document. This helps in identifying relevant and important words for further text analysis.
- Performs Stop Words Removal to Ignore common words that are not important in the analysis, improving the quality of text features.
- Performs Model Persistence by using joblib to store the trained tfidf_vectorizer objects so that they can be reused without having to retrain, which is efficient in terms of computing time and resources.</li>
      <li><strong>Service Feature :</strong> The Neural Network model used, built with an architecture consisting of two hidden layers and one output layer with activation functions suitable for binary classification tasks. Then, Optimizer and Loss Function, using Adam optimizer and binary crossentropy loss function.</li>
      <li><strong>Self Service and Express Features : </strong> Neural Network model that uses backpropagation with Adam optimizer and MSE loss function. Then, the model architecture, consisting of input layers for latitude, longitude, and distance, one concatenation layer to combine inputs, a normalization layer, two hidden layers with ReLU neurons and activation functions, and dropouts to prevent overfitting.</li>
    </ol>
  </li>
</ol>
