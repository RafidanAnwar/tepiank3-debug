const crypto = require('crypto');

// Simple CSRF token implementation
class CSRFProtection {
  constructor() {
    this.tokens = new Map();
    this.tokenExpiry = 60 * 60 * 1000; // 1 hour
  }

  generateToken(sessionId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + this.tokenExpiry;
    
    this.tokens.set(sessionId, { token, expiry });
    
    // Clean expired tokens
    this.cleanExpiredTokens();
    
    return token;
  }

  validateToken(sessionId, token) {
    const stored = this.tokens.get(sessionId);
    
    if (!stored) return false;
    if (Date.now() > stored.expiry) {
      this.tokens.delete(sessionId);
      return false;
    }
    
    return stored.token === token;
  }

  cleanExpiredTokens() {
    const now = Date.now();
    for (const [sessionId, data] of this.tokens.entries()) {
      if (now > data.expiry) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

const csrfProtection = new CSRFProtection();

// Middleware to generate CSRF token (DISABLED)
const generateCSRFToken = (req, res, next) => {
  // CSRF protection disabled - skip token generation
  next();
};

// Middleware to validate CSRF token (DISABLED)
const validateCSRFToken = (req, res, next) => {
  // CSRF protection disabled - skip validation
  next();
};

module.exports = {
  generateCSRFToken,
  validateCSRFToken,
  csrfProtection
};