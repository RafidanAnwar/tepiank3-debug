const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, firstname: true, fullname: true, role: true, isActive: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Akses ditolak: Role tidak ditemukan' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Akses ditolak: Role tidak sesuai' });
    }

    next();
  };
};

const requireAdmin = (req, res, next) => {
  console.log('Checking admin access for user:', req.user.email, 'Role:', req.user.role);

  if (req.user.role !== 'ADMIN') {
    console.log('Access denied - user is not admin');
    return res.status(403).json({ error: 'Admin access required' });
  }

  console.log('Admin access granted');
  next();
};

module.exports = { authenticate, authenticateToken: authenticate, authorize, requireAdmin };
