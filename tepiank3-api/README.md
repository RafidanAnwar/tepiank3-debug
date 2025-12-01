# Tepian K3 API

Backend API untuk aplikasi Tepian K3 menggunakan Express.js, Prisma ORM, dan PostgreSQL.

## 🚀 Setup

### Prerequisites
- Node.js (v16 atau lebih baru)
- PostgreSQL database
- npm atau yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env
```
Edit file `.env` dan sesuaikan dengan konfigurasi database Anda.

3. Setup database:
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

4. Start development server:
```bash
npm run dev
```

Server akan berjalan di `http://localhost:3001`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
<<<<<<< HEAD
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
=======
>>>>>>> ed9176be0b72abd83b2f0ea05b612d1b912e37b9

### Users
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id/role` - Update user role (admin only)
<<<<<<< HEAD
- `POST /api/users/avatar` - Upload user avatar
- `PUT /api/users/last-login` - Update last login timestamp
=======
>>>>>>> ed9176be0b72abd83b2f0ea05b612d1b912e37b9

### Clusters
- `GET /api/clusters` - Get all clusters
- `GET /api/clusters/:id` - Get cluster by ID
- `POST /api/clusters` - Create cluster (admin only)
- `PUT /api/clusters/:id` - Update cluster (admin only)
- `DELETE /api/clusters/:id` - Delete cluster (admin only)

### Jenis Pengujian
- `GET /api/jenis-pengujian` - Get all jenis pengujian
- `GET /api/jenis-pengujian/:id` - Get jenis pengujian by ID
- `POST /api/jenis-pengujian` - Create jenis pengujian (admin only)
- `PUT /api/jenis-pengujian/:id` - Update jenis pengujian (admin only)
- `DELETE /api/jenis-pengujian/:id` - Delete jenis pengujian (admin only)

### Parameters
- `GET /api/parameters` - Get all parameters
- `GET /api/parameters/:id` - Get parameter by ID
- `POST /api/parameters` - Create parameter (admin only)
- `PUT /api/parameters/:id` - Update parameter (admin only)
- `DELETE /api/parameters/:id` - Delete parameter (admin only)
<<<<<<< HEAD
- `POST /api/parameters/bulk` - Bulk create parameters (admin only)
- `PUT /api/parameters/bulk/prices` - Bulk update prices (admin only)
=======
>>>>>>> ed9176be0b72abd83b2f0ea05b612d1b912e37b9

### Peralatan
- `GET /api/peralatan` - Get all peralatan
- `GET /api/peralatan/:id` - Get peralatan by ID
- `POST /api/peralatan` - Create peralatan (admin only)
- `PUT /api/peralatan/:id` - Update peralatan (admin only)
- `DELETE /api/peralatan/:id` - Delete peralatan (admin only)

<<<<<<< HEAD
### Pegawai
- `GET /api/pegawai` - Get all pegawai
- `GET /api/pegawai/:id` - Get pegawai by ID
- `POST /api/pegawai` - Create pegawai (admin only)
- `PUT /api/pegawai/:id` - Update pegawai (admin only)
- `DELETE /api/pegawai/:id` - Delete pegawai (admin only)

### Pengujian
- `GET /api/pengujian` - Get all pengujian (user specific)
- `GET /api/pengujian/admin/all-pengajuan` - Get all pengajuan (admin only)
- `GET /api/pengujian/:id` - Get pengujian by ID
- `POST /api/pengujian` - Create new pengujian
- `PATCH /api/pengujian/:id/status` - Update pengujian status
- `PATCH /api/pengujian/:id/results` - Update pengujian results (admin only)

### Orders
- `GET /api/orders` - Get orders (user: own orders)
- `GET /api/orders/admin/all-orders` - Get all orders (admin only)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders/:id/revise` - Revise order (admin only)
- `PATCH /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/upload-penawaran` - Upload penawaran (admin only)
- `POST /api/orders/:id/upload-invoice` - Upload invoice (admin only)
- `POST /api/orders/:id/upload-bukti-bayar` - Upload bukti bayar
- `POST /api/orders/:id/verify-payment` - Verify payment (admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/navbar-stats` - Get navbar statistics
- `GET /api/dashboard/popular-parameters` - Get popular parameters (admin only)

### Worksheet
- `GET /api/worksheet` - Get all worksheets
- `GET /api/worksheet/:id` - Get worksheet by ID
- `POST /api/worksheet` - Create worksheet
- `POST /api/worksheet/submit` - Submit worksheet
- `PUT /api/worksheet/:id` - Update worksheet
- `PUT /api/worksheet/item/:id` - Update worksheet item
- `DELETE /api/worksheet/:id` - Delete worksheet (admin only)
=======
### Orders
- `GET /api/orders` - Get orders (user: own orders, admin: all orders)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order (authenticated)
- `PUT /api/orders/:id/status` - Update order status (admin only)
>>>>>>> ed9176be0b72abd83b2f0ea05b612d1b912e37b9

## 🔐 Authentication

API menggunakan JWT (JSON Web Token) untuk authentication. Setelah login, sertakan token di header:

```
Authorization: Bearer <your-jwt-token>
```

## 👥 Default Users

Setelah menjalankan seed, default users akan dibuat dengan credentials yang dikonfigurasi di environment variables:
- **Admin**: admin@tepiank3.com / [lihat DEFAULT_ADMIN_PASSWORD di .env]
- **User**: user@tepiank3.com / [lihat DEFAULT_USER_PASSWORD di .env]

⚠️ **Penting**: Ubah password default ini di production!

## 🛠 Development Commands

```bash
# Start development server
npm run dev

# Generate Prisma client
npm run db:generate

# Create and run migration
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Start production server
npm start
```

## 📁 Project Structure

```
tepiank3-api/
<<<<<<< HEAD
├── controllers/       # Business logic
│   ├── authController.js
│   ├── userController.js
│   ├── clusterController.js
│   ├── jenisPengujianController.js
│   ├── parameterController.js
│   ├── peralatanController.js
│   ├── pegawaiController.js
│   ├── pengujianController.js
│   ├── orderController.js
│   ├── dashboardController.js
│   └── worksheetController.js
├── routes/            # Route definitions
=======
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── routes/
>>>>>>> ed9176be0b72abd83b2f0ea05b612d1b912e37b9
│   ├── auth.js
│   ├── users.js
│   ├── clusters.js
│   ├── jenisPengujian.js
│   ├── parameters.js
│   ├── peralatan.js
<<<<<<< HEAD
│   ├── pegawai.js
│   ├── pengujian.js
│   ├── orders.js
│   ├── dashboard.js
│   └── worksheet.js
├── middleware/        # Express middleware
│   └── auth.js
├── prisma/            # Database schema and seeds
│   ├── schema.prisma
│   └── seed.js
├── scripts/           # Utility scripts
│   ├── sql/
│   ├── check_data.js
│   └── ...
├── .env
├── app.js             # Express app configuration
├── server.js          # Server entry point
=======
│   └── orders.js
├── middleware/
│   └── auth.js
├── .env
├── app.js
>>>>>>> ed9176be0b72abd83b2f0ea05b612d1b912e37b9
└── package.json
```

## 🔧 Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/tepiank3_db"
DEFAULT_ADMIN_PASSWORD="your-admin-password"
DEFAULT_USER_PASSWORD="your-user-password"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```