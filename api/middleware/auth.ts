import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { getAuthToken } from '../lib/cookie.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'student-data-manager-super-secret-key-2026-secure';

export interface AuthUserPayload {
  userId?: string;
  email: string;
  role: 'teacher' | 'student';
  studentId?: string | null;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = getAuthToken(req);

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication session required.',
      code: 'AUTH_REQUIRED',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid or expired session token.',
      code: 'TOKEN_INVALID',
    });
  }
}

export function requireRole(expectedRole: 'teacher' | 'student') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
