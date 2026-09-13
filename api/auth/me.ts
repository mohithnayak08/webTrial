import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getAuthToken } from '../lib/cookie.js';
import { AuthUserPayload } from '../middleware/auth.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'student-data-manager-super-secret-key-2026-secure';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const token = getAuthToken(req);
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication session required.',
      code: 'AUTH_REQUIRED',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    return res.status(200).json({ user: decoded });
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid or expired session token.',
      code: 'TOKEN_INVALID',
    });
  }
}
