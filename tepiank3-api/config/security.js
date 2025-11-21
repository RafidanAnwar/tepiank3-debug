// Security configuration
const securityConfig = {
  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    algorithm: 'HS256',
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5, // auth endpoints limit
  },
  
  // CSRF Protection
  csrf: {
    tokenExpiry: parseInt(process.env.CSRF_TOKEN_EXPIRY) || 60 * 60 * 1000, // 1 hour
    excludePaths: ['/api/auth/', '/api/health'],
  },
  
  // CORS configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  
  // Default credentials (for seeding only)
  defaultCredentials: {
    adminPassword: process.env.DEFAULT_ADMIN_PASSWORD,
    userPassword: process.env.DEFAULT_USER_PASSWORD,
  },
};

module.exports = securityConfig;