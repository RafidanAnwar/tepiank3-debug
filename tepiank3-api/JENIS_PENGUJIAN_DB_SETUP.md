# Setup Database untuk Jenis Pengujian

## ✅ Status Koneksi

Fitur Jenis Pengujian sudah terhubung dengan database melalui:
- ✅ Backend API: `routes/jenisPengujian.js`
- ✅ Prisma ORM: Model `JenisPengujian` di `schema.prisma`
- ✅ Frontend Service: `services/jenisPengujianService.js`
- ✅ Frontend Component: `admin/jenisPengujian.jsx`

## 🔧 Verifikasi Koneksi Database

### 1. Pastikan Environment Variables Sudah Diatur

File `.env` di folder `tepiank3-api` harus berisi:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/tepiank3_db"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=3001
```

### 2. Generate Prisma Client

```bash
cd tepiank3-api
npm run db:generate
```

### 3. Jalankan Migration (jika belum)

```bash
npm run db:migrate
```

### 4. Seed Database (opsional)

```bash
npm run db:seed
```

### 5. Start Backend Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3001`

### 6. Start Frontend

```bash
cd tepiank3-app
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## 📊 Struktur Database

### Model JenisPengujian

```prisma
model JenisPengujian {
  id          Int         @id @default(autoincrement())
  name        String
  description String?
  clusterId   Int
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  isActive    Boolean     @default(true)
  cluster     Cluster     @relation(fields: [clusterId], references: [id], onDelete: Cascade)
  parameters  Parameter[]
  pengujian   Pengujian[]

  @@unique([name, clusterId])
  @@index([clusterId])
  @@index([name])
  @@index([isActive])
  @@map("jenis_pengujian")
}
```

## 🔌 API Endpoints

### GET /api/jenis-pengujian
- **Method**: GET
- **Auth**: Tidak diperlukan
- **Query Params**: 
  - `clusterId` (optional): Filter by cluster
- **Response**: Array of jenis pengujian dengan cluster data

### GET /api/jenis-pengujian/:id
- **Method**: GET
- **Auth**: Tidak diperlukan
- **Response**: Single jenis pengujian dengan cluster dan parameters

### POST /api/jenis-pengujian
- **Method**: POST
- **Auth**: Required (Admin only)
- **Body**:
  ```json
  {
    "name": "Nama Jenis Pengujian",
    "description": "Deskripsi (optional)",
    "clusterId": 1
  }
  ```
- **Response**: Created jenis pengujian dengan cluster data

### PUT /api/jenis-pengujian/:id
- **Method**: PUT
- **Auth**: Required (Admin only)
- **Body**: Partial update (hanya field yang diubah)
  ```json
  {
    "name": "Nama Baru"  // atau
    "description": "Deskripsi Baru"  // atau
    "clusterId": 2
  }
  ```
- **Response**: Updated jenis pengujian dengan cluster data

### DELETE /api/jenis-pengujian/:id
- **Method**: DELETE
- **Auth**: Required (Admin only)
- **Response**: Success message

## 🧪 Testing Koneksi

### 1. Test dengan Prisma Studio

```bash
cd tepiank3-api
npm run db:studio
```

Buka browser di `http://localhost:5555` dan cek tabel `jenis_pengujian`

### 2. Test dengan API

```bash
# Get all jenis pengujian
curl http://localhost:3001/api/jenis-pengujian

# Get by cluster
curl http://localhost:3001/api/jenis-pengujian?clusterId=1
```

### 3. Test dari Frontend

1. Login sebagai admin
2. Navigate ke halaman `/Cluster` dan pastikan ada data cluster
3. Navigate ke halaman `/JenisPengujian`
4. Coba tambah, edit, dan hapus data

## ⚠️ Troubleshooting

### Error: "Failed to fetch jenis pengujian"

**Kemungkinan penyebab:**
1. Backend server tidak berjalan
2. Database tidak terhubung
3. Migration belum dijalankan

**Solusi:**
```bash
# Cek apakah backend berjalan
curl http://localhost:3001/api/health

# Cek koneksi database
cd tepiank3-api
npm run db:studio

# Jalankan migration
npm run db:migrate
```

### Error: "Cluster tidak ditemukan"

**Kemungkinan penyebab:**
- Cluster dengan ID tersebut tidak ada di database

**Solusi:**
- Pastikan ada data cluster di database
- Cek dengan: `GET /api/clusters`

### Error: "Nama jenis pengujian sudah ada di cluster ini"

**Kemungkinan penyebab:**
- Unique constraint: nama + clusterId harus unik

**Solusi:**
- Gunakan nama yang berbeda atau cluster yang berbeda

## 📝 Catatan Penting

1. **Partial Update**: Backend sekarang mendukung partial update, jadi Anda bisa update hanya field tertentu tanpa harus mengirim semua field.

2. **Relasi**: JenisPengujian memiliki relasi dengan:
   - Cluster (required)
   - Parameter (one-to-many)
   - Pengujian (one-to-many)

3. **Cascade Delete**: Jika cluster dihapus, semua jenis pengujian di cluster tersebut juga akan dihapus.

4. **Validation**: 
   - Nama: Required, max 100 karakter
   - Deskripsi: Optional, max 500 karakter
   - ClusterId: Required, harus valid cluster ID

## ✅ Checklist Setup

- [ ] Database PostgreSQL sudah berjalan
- [ ] File `.env` sudah dikonfigurasi dengan benar
- [ ] Prisma client sudah di-generate (`npm run db:generate`)
- [ ] Migration sudah dijalankan (`npm run db:migrate`)
- [ ] Backend server berjalan di port 3001
- [ ] Frontend server berjalan di port 5173
- [ ] Ada data cluster di database (diperlukan untuk membuat jenis pengujian)
- [ ] User admin sudah dibuat dan bisa login

## 🎉 Selesai!

Jika semua checklist sudah dicentang, fitur Jenis Pengujian sudah siap digunakan!

