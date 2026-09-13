import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { connectToDatabase } from '../lib/db';
import { Student } from '../models/Student';
import { getAuthToken } from '../lib/cookie';
import { AuthUserPayload } from '../middleware/auth';

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

  let decoded: AuthUserPayload;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid or expired session token.',
      code: 'TOKEN_INVALID',
    });
  }

  if (decoded.role !== 'student') {
    return res.status(403).json({
      error: 'Forbidden: Action restricted to student role only.',
      code: 'FORBIDDEN',
    });
  }

  const studentId = decoded.studentId;
  if (!studentId) {
    return res.status(403).json({
      error: 'Forbidden: No student ID associated with this account.',
      code: 'NO_STUDENT_REF',
    });
  }

  await connectToDatabase();

  try {
    const student = await Student.findOne({ id: studentId });
    if (!student) {
      return res.status(404).json({ error: `Student profile "${studentId}" not found.` });
    }
    return res.status(200).json(student);
  } catch (err: any) {
    console.error('Failed to query student profile:', err);
    return res.status(500).json({ error: err.message });
  }
}
