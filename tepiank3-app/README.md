# Frontend Tepian K3

Aplikasi Frontend untuk Tepian K3, dibangun menggunakan React, Vite, dan Tailwind CSS.

## Daftar Isi
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Proyek](#struktur-proyek)
- [Fitur Utama](#fitur-utama)

## Prasyarat

-   Node.js (v18 atau lebih baru)
-   npm (v9 atau lebih baru)

## Instalasi

1.  **Clone repositori** (jika belum dilakukan):
    ```bash
    git clone <repository-url>
    cd tepiank3/tepiank3-app
    ```

2.  **Install dependensi**:
    ```bash
    npm install
    ```

## Konfigurasi

1.  **Variabel Lingkungan (Environment Variables)**:
    Salin `.env.example` menjadi `.env` (atau buat baru) dan konfigurasikan sebagai berikut:

    ```env
    # URL API Backend
    # Untuk Development lokal tanpa Docker: http://localhost:3001/api
    # Untuk Docker/Production (lewat Nginx proxy): /api
    VITE_API_BASE_URL=/api

    # Timeout Request (ms)
    VITE_API_TIMEOUT=10000

    # Environment
    VITE_NODE_ENV=production
    ```

## Menjalankan Aplikasi

### Development (Pengembangan)
Menjalankan server development Vite dengan hot-reloading.
```bash
npm run dev
```
Akses di `http://localhost:5173`

### Production (Produksi)
Membangun aplikasi untuk produksi.
```bash
npm run build
```
Hasil build akan berada di folder `dist/`.

### Docker
Aplikasi ini disajikan menggunakan Nginx dalam container Docker.
```bash
# Dari root project
docker-compose up --build -d
```

## Struktur Proyek

```
tepiank3-app/
├── public/             # Aset statis (gambar, ikon, dll.)
├── src/
│   ├── admin/          # Komponen/Halaman khusus Admin (Legacy/Refactor)
│   ├── context/        # React Context (State Management global)
│   ├── pages/          # Halaman Aplikasi
│   │   ├── admin/      # Halaman Dashboard Admin
│   │   ├── auth/       # Halaman Login/Register
│   │   └── user/       # Halaman Dashboard User
│   ├── routes/         # Komponen Routing (ProtectedRoute)
│   ├── App.jsx         # Konfigurasi Routing Utama
│   └── main.jsx        # Entry point React
├── index.html          # HTML Utama
├── vite.config.js      # Konfigurasi Vite
├── tailwind.config.js  # Konfigurasi Tailwind CSS
└── package.json        # Dependensi dan skrip
```

## Fitur Utama

-   **Otentikasi**: Login, Register, Lupa Password dengan JWT.
-   **Role-Based Access**: Akses terpisah untuk User dan Admin.
-   **Dashboard User**:
    -   Pengajuan Pengujian
    -   Keranjang Belanja (Cart)
    -   Riwayat Transaksi
    -   Status Pengujian
-   **Dashboard Admin**:
    -   Manajemen Worksheet
    -   Verifikasi Pembayaran
    -   Manajemen Master Data (Parameter, Klaster, User, dll.)
-   **Responsive Design**: Tampilan yang menyesuaikan perangkat (Desktop/Mobile).

## Skrip

-   `npm run dev`: Menjalankan server development
-   `npm run build`: Membuild aplikasi untuk production
-   `npm run preview`: Menjalankan preview hasil build lokal
-   `npm run lint`: Memeriksa kode dengan ESLint
