# API Tepian K3

API Backend untuk aplikasi Tepian K3, dibangun menggunakan Node.js, Express, dan Prisma.

## Daftar Isi
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Proyek](#struktur-proyek)
- [Endpoint API](#endpoint-api)

## Prasyarat

-   Node.js (v18 atau lebih baru)
-   PostgreSQL (v14 atau lebih baru)
-   npm (v9 atau lebih baru)

## Instalasi

1.  **Clone repositori** (jika belum dilakukan):
    ```bash
    git clone <repository-url>
    cd tepiank3/tepiank3-api
    ```

2.  **Install dependensi**:
    ```bash
    npm install
    ```

## Konfigurasi

1.  **Variabel Lingkungan (Environment Variables)**:
    Salin `.env.example` menjadi `.env` (atau buat baru) dan konfigurasikan sebagai berikut:

    ```env
    # Konfigurasi Server
    PORT=3001
    NODE_ENV=development

    # Database
    DATABASE_URL="postgresql://user:password@localhost:5432/tepiank3?schema=public"

    # Keamanan
    JWT_SECRET="kunci-rahasia-anda"
    JWT_EXPIRES_IN="7d"

    # CORS
    FRONTEND_URL="http://localhost:5173,http://localhost:3000"
    ```

2.  **Setup Database**:
    ```bash
    # Generate Prisma Client
    npx prisma generate

    # Jalankan Migrasi
    npx prisma migrate dev

    # Seed Database (Opsional - Isi data awal)
    npm run db:seed
    ```

## Menjalankan Aplikasi

### Development (Pengembangan)
Menjalankan server dengan `nodemon` untuk hot-reloading.
```bash
npm run dev
```

### Production (Produksi)
```bash
npm start
```

### Docker
Aplikasi ini sudah ter-containerisasi. Lihat `docker-compose.yml` di root folder untuk orkestrasi.
```bash
# Dari root project
docker-compose up --build -d
```

## Struktur Proyek

```
tepiank3-api/
├── config/             # File konfigurasi (keamanan, dll.)
├── controllers/        # Handler request (Logika bisnis)
├── middleware/         # Middleware Express (auth, keamanan, dll.)
├── prisma/             # Skema database dan migrasi
│   ├── migrations/     # File migrasi SQL
│   └── schema.prisma   # Definisi skema Prisma
├── routes/             # Definisi rute API
├── uploads/            # Direktori untuk file yang diunggah
├── app.js              # Setup aplikasi Express
├── server.js           # Entry point server
└── package.json        # Dependensi dan skrip
```

## Endpoint API

### Otentikasi (Auth)
-   `POST /api/auth/register` - Daftar user baru
-   `POST /api/auth/login` - Login user
-   `POST /api/auth/logout` - Logout user

### Pengguna (Users)
-   `GET /api/users/profile` - Ambil profil user saat ini
-   `PUT /api/users/profile` - Update profil user
-   `PUT /api/users/change-password` - Ganti password

### Pesanan & Pengujian
-   `POST /api/orders` - Buat pesanan baru
-   `GET /api/orders` - List pesanan
-   `GET /api/orders/:id` - Detail pesanan
-   `GET /api/pengujian` - List pengujian
-   `POST /api/pengujian` - Buat pengujian

### Admin Resources
-   `GET /api/dashboard/stats` - Statistik dashboard
-   `GET /api/clusters` - Kelola klaster
-   `GET /api/parameters` - Kelola parameter
-   `GET /api/peralatan` - Kelola peralatan
-   `GET /api/pegawai` - Kelola pegawai
-   `GET /api/worksheets` - Kelola worksheet (lembar kerja)

## Skrip

-   `npm start`: Menjalankan server production
-   `npm run dev`: Menjalankan server development
-   `npm run db:generate`: Generate Prisma client
-   `npm run db:migrate`: Menjalankan migrasi database
-   `npm run db:seed`: Mengisi database dengan data awal (seeding)
