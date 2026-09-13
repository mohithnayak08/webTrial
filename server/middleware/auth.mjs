import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'student-data-manager-super-secret-key-2026-secure';

export function requireAuth(req, res, next) {
  let token = null;

  // 1. Check httpOnly cookie
  if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  // 2. Fallback to Authorization header Bearer token
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication session required.',
      code: 'AUTH_REQUIRED',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid or expired session token.',
      code: 'TOKEN_INVALID',
    });
  }
}

export function requireRole(expectedRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized: Authentication required.',
        code: 'AUTH_REQUIRED',
      });
    }

    if (req.user.role !== expectedRole) {
      return res.status(403).json({
        error: `Forbidden: Action restricted to ${expectedRole} role only. Current role: ${req.user.role}`,
        code: 'FORBIDDEN',
      });
    }

    next();
  };
}
