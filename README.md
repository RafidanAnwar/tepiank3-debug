# Tepian K3 - Sistem Pelayanan Pengujian dan Pelatihan K3

Aplikasi web untuk manajemen pelayanan pengujian dan pelatihan K3 (Keselamatan dan Kesehatan Kerja). Proyek ini terdiri dari Backend (API) dan Frontend (Web App) yang terintegrasi.

## Arsitektur

Proyek ini menggunakan arsitektur *microservices* sederhana yang diorkestrasi menggunakan Docker:

-   **Backend (`tepiank3-api`)**: Node.js, Express, Prisma, PostgreSQL.
-   **Frontend (`tepiank3-app`)**: React, Vite, Tailwind CSS, Nginx.
-   **Database**: PostgreSQL 15.

## Prasyarat

-   [Docker](https://www.docker.com/products/docker-desktop/)
-   [Git](https://git-scm.com/)

## Cara Menjalankan (Quick Start)

Cara termudah untuk menjalankan aplikasi ini adalah menggunakan Docker Compose.

1.  **Clone Repositori**
    ```bash
    git clone https://github.com/RafidanAnwar/tepiank3-debug.git
    cd tepiank3-debug
    ```

2.  **Konfigurasi Environment**
    Pastikan file `.env` sudah tersedia di folder `tepiank3-api` dan `tepiank3-app`. Lihat dokumentasi di masing-masing folder untuk detailnya.

3.  **Jalankan Aplikasi**
    ```bash
    docker-compose up --build -d
    ```
    Perintah ini akan membangun image Docker, membuat network, dan menjalankan container untuk Database, API, dan Frontend.

4.  **Akses Aplikasi**
    -   **Web App**: Buka [http://localhost](http://localhost) di browser.
    -   **API**: [http://localhost:3001](http://localhost:3001).

## Struktur Proyek

```
tepiank3/
├── tepiank3-api/       # Kode sumber Backend (Node.js)
│   └── README.md       # Dokumentasi Backend
├── tepiank3-app/       # Kode sumber Frontend (React)
│   └── README.md       # Dokumentasi Frontend
├── docker-compose.yml  # Konfigurasi orkestrasi Docker
└── README.md           # Dokumentasi Utama (File ini)
```

## Troubleshooting

### Database Kosong / Error 500
Jika baru pertama kali dijalankan, database mungkin kosong. Jalankan perintah berikut untuk migrasi dan seeding data:

```bash
# Jalankan migrasi
docker-compose exec api npx prisma migrate deploy

# Isi data awal (Seeding)
docker-compose exec api npm run db:seed
```

### Error Upload (413 Request Entity Too Large)
Nginx sudah dikonfigurasi untuk menerima upload hingga 10MB. Jika Anda mengubah konfigurasi, pastikan untuk me-rebuild container:
```bash
docker-compose up --build -d
```

### Melihat Log
Untuk melihat log dari service tertentu (misalnya `api`):
```bash
docker-compose logs -f api
```

## Pengembangan

Untuk pengembangan lebih lanjut, silakan merujuk ke dokumentasi spesifik di setiap folder:
-   [Dokumentasi Backend (API)](./tepiank3-api/README.md)
-   [Dokumentasi Frontend (App)](./tepiank3-app/README.md)
