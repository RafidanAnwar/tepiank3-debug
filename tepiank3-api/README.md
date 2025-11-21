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

### Users
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id/role` - Update user role (admin only)

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

### Peralatan
- `GET /api/peralatan` - Get all peralatan
- `GET /api/peralatan/:id` - Get peralatan by ID
- `POST /api/peralatan` - Create peralatan (admin only)
- `PUT /api/peralatan/:id` - Update peralatan (admin only)
- `DELETE /api/peralatan/:id` - Delete peralatan (admin only)

### Orders
- `GET /api/orders` - Get orders (user: own orders, admin: all orders)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order (authenticated)
- `PUT /api/orders/:id/status` - Update order status (admin only)

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
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── clusters.js
│   ├── jenisPengujian.js
│   ├── parameters.js
│   ├── peralatan.js
│   └── orders.js
├── middleware/
│   └── auth.js
├── .env
├── app.js
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