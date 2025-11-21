// Security middleware (DISABLED)
// Rate limiting disabled
const authRateLimit = (req, res, next) => next();
const apiRateLimit = (req, res, next) => next();

// Security headers disabled
const securityHeaders = (req, res, next) => next();

// Input sanitization disabled
const sanitizeInput = (req, res, next) => next();

module.exports = {
  authRateLimit,
  apiRateLimit,
  securityHeaders,
  sanitizeInput
};