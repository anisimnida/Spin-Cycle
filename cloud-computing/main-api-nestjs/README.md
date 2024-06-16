# Spin-Cycle RESTful-API

The SpinCycle RESTful-API provides recommendations for nearby laundry services based on the user's current location and specific requirements. Whether users need express service, delivery options, or special care for delicate fabrics, the API helps find the best match.

## Features

- **Location-Based Recommendations:** Retrieve laundry services close to the user’s location.
- **Service-Type Filters:** Filter services by type, such as express, delivery, and more.
- **User Reviews and Ratings:** Access user ratings and reviews for informed decision-making.

## Usage

Use the SpinCycle API to seamlessly integrate laundry service recommendations into your application, offering users quick and convenient solutions for their laundry needs.

# Table of Contents

- [Spin-Cycle RESTful-API](#spin-cycle-restful-api)
  - [Features](#features)
  - [Usage](#usage)
- [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
  - [Full Endpoint Documentaion In Here](#full-endpoint-documentaion-in-here)
  - [Disclaimer](#disclaimer)

## Prerequisites

Before running the Jemparingan-Scoring-System backend application, make sure you have the following installed:

- **Nest.Js**

- **Prisma ORM**

- **Node.Js**

## Installation

1. git clone < GitHub_Final_Link >

2. cd RestFull-API

3. npm install

## Configuration

Before running the application, you need to configure the following settings in the `.env`, file:

- PostgresSQL database configuration:

  - `.env['POSTGRES_USER']`: The PostgresSQL username.
  - `.env['POSTGRES_PASSWORD']`: The PostgresSQL password.
  - `.env['POSTGRES_DB']`: The name of the PostgresSQL database.
  - `.env['DB_HOST']`: The name of the database host.
  - `.env['DB_PORT']`: The name of the database port.
  - `.env['DATABASE_URL']`: The PostgresSQL server host.

- Server Configuration
  - `.env['PORT']`: The Server port.

- JWT secret key:
  - `.env['AT_SECRET']`: A secret key used for generate Access token. , You can generate a random key or provide your own.
  - `.env['RT_SECRET']`: A secret key used for generate Refresh token. , You can generate a random key or provide your own.
  - `.env['AT_EXPIRES_IN']`: This key is utilized to specify the expiration time for Access tokens you can provide your own.
  - `.env['RT_EXPIRES_IN']`: This key is utilized to specify the expiration time for Refresh tokens you can provide your own.

- Google Storage Bucket Configuration
  - `.env['GOOGLE_APPLICATION_CREDENTIALS']`: This variable specifies the path to the JSON file containing the Google Cloud service account key. You can provide your own service account credentials by specifying the path to the JSON file.
  - `.env['GOOGLE_PROJECT_ID']`: This variable specifies the unique identifier for your Google Cloud project. You can provide your own project ID.
  - `.env['GOOGLE_BUCKET_NAME']`: This variable specifies the name of the Google Cloud Storage bucket to be accessed. You can provide the name of your own bucket.

## Running the Application

To run the this jemparingan scoring system application, execute the following command:

``` shell
npm run start
 ```

## Full Endpoint Documentaion In Here

- TBD

Make sure you have the required dependencies installed and the necessary configurations set before running the application.

That's it! You have successfully set up and documented the Spin Cycle backend application.

## Disclaimer

- This project is created for educational purpose as the requirement to graduate from [**_Bangkit Academy led by Google, Tokopedia, Gojek, & Traveloka_**.](https://www.linkedin.com/company/bangkit-academy/mycompany/)
