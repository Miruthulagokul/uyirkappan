const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'uyirkappan-dev-secret-key-change-in-production';

/**
 * Middleware: Verify JWT token from Authorization header.
 * Attaches decoded user to `req.user`.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware factory: Require specific role(s).
 * Usage: requireRole('OPERATOR') or requireRole('OPERATOR', 'DRIVER')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Requires one of roles: ${roles.join(', ')}` });
    }
    next();
  };
}

/**
 * Optional auth — attaches user if token present, but doesn't block.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (_) {
      // Ignore invalid tokens for optional auth
    }
  }
  next();
}

module.exports = { authenticate, requireRole, optionalAuth, JWT_SECRET };
