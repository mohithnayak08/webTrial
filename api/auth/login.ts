import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { connectToDatabase } from '../lib/db';
import { User, IUser } from '../models/User';
import { setAuthCookie } from '../lib/cookie';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'student-data-manager-super-secret-key-2026-secure';

export async function findUserByIdentifier(rawIdentifier: string): Promise<IUser | null> {
  if (!rawIdentifier) return null;
  const trimmed = rawIdentifier.trim();
  const lower = trimmed.toLowerCase();
  const upper = trimmed.toUpperCase();

  let user = await User.findOne({
    $or: [
      { email: lower },
      { studentRef: upper },
      { studentRef: trimmed },
      { id: upper },
      { id: trimmed },
      { name: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    ],
  }).select('+passwordHash');

  if (user) return user;

  const digitsMatch = trimmed.match(/\d{4}/);
  if (digitsMatch) {
    const formattedId = `STU-${digitsMatch[0]}`;
    user = await User.findOne({
      $or: [
        { studentRef: formattedId },
        { id: `USR-${formattedId}` },
      ],
    }).select('+passwordHash');
    if (user) return user;
  }

  return null;
}

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  await connectToDatabase();

  const { identifier, password } = req.body || {};
  if (!identifier || !password) {
    return res.status(401).json({ error: 'Invalid credentials. Identifier and password are required.' });
  }

  try {
    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const payload = {
      userId: user.id || (user._id ? user._id.toString() : undefined),
      email: user.email,
      role: user.role,
      studentId: user.studentRef || null,
      name: user.name,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      user: {
        userId: user.id || user._id,
        email: user.email,
        role: user.role,
        studentId: user.studentRef || null,
        name: user.name,
      },
    });
  } catch (err: any) {
    console.error('[Auth Login Error]:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
}
