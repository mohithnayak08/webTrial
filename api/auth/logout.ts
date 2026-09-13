import type { Request, Response } from 'express';
import { clearAuthCookie } from '../lib/cookie';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  clearAuthCookie(res);
  return res.status(200).json({ success: true, message: 'Successfully signed out.' });
}
