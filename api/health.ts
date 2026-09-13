import type { Request, Response } from 'express';
import { getDbHealth } from './lib/db.js';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const health = await getDbHealth();
  return res.status(200).json({
    status: health.isConnected ? 'connected' : 'disconnected',
    ...health,
  });
}
