require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { securityHeaders, sanitizeInput, apiRateLimit } = require('./middleware/security');
const { generateCSRFToken } = require('./middleware/csrf');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clusterRoutes = require('./routes/clusters');
const jenisPengujianRoutes = require('./routes/jenisPengujian');
const parameterRoutes = require('./routes/parameters');
const peralatanRoutes = require('./routes/peralatan');
const pegawaiRoutes = require('./routes/pegawai');
const pengujianRoutes = require('./routes/pengujian');
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');
const worksheetRoutes = require('./routes/worksheet');

const app = express();
const prisma = new PrismaClient();

// Security middleware
app.use(securityHeaders);
app.use(apiRateLimit);
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id', 'X-Session-Id']
}));
app.use(express.json({ limit: '10mb' }));
app.use(sanitizeInput);
app.use(generateCSRFToken);

// Serve static files for avatars
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clusters', clusterRoutes);
app.use('/api/jenis-pengujian', jenisPengujianRoutes);
app.use('/api/parameters', parameterRoutes);
app.use('/api/peralatan', peralatanRoutes);
app.use('/api/pegawai', pegawaiRoutes);
app.use('/api/pengujian', pengujianRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/worksheets', worksheetRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Tepian K3 API is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;