# Gunakan image Python yang ringan sebagai base image
FROM python:3.9-slim

# Set environment variable
ENV PYTHONUNBUFFERED=1

# Buat direktori kerja untuk aplikasi
WORKDIR /app

# Salin requirements.txt dan instal dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Salin seluruh aplikasi ke dalam direktori kerja
COPY . /app/

# Expose port yang digunakan oleh aplikasi Flask
EXPOSE 8000

# Command untuk menjalankan aplikasi menggunakan gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]
