import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase, getDbHealth } from './lib/db.js';
import { User, IUser } from './models/User.js';
import { Student } from './models/Student.js';
import { requireAuth, requireRole, AuthenticatedRequest } from './middleware/auth.js';
import { setAuthCookie, clearAuthCookie } from './lib/cookie.js';
import { getInitialSeedData } from './lib/seedLoader.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'student-data-manager-super-secret-key-2026-secure';

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// Middleware to ensure DB connection on every request (serverless safe)
app.use(async (_req, _res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err: any) {
    console.error('[DB Connection Middleware Error]:', err.message);
    res.status(500).json({ error: 'Database connection failed. Please try again later.' });
  }
});

app.use((req, _res, next) => {
  console.log(`[API ${req.method}] ${req.url}`);
  next();
});

async function findUserByIdentifier(rawIdentifier: string): Promise<IUser | null> {
  if (!rawIdentifier) return null;
  const trimmed = rawIdentifier.trim();
  const lower = trimmed.toLowerCase();
  const upper = trimmed.toUpperCase();

  // 1. Direct email, studentRef, or user id match
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

  // 2. Normalized student ID: e.g. "STU1001", "stu1001", or "1001" -> "STU-1001"
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

// ==========================================
// 1. PUBLIC HEALTH & MONITORING
// ==========================================
app.get('/api/health', async (_req: Request, res: Response) => {
  const health = await getDbHealth();
  res.json({
    status: health.isConnected ? 'connected' : 'disconnected',
    ...health,
  });
});

// ==========================================
// 2. AUTHENTICATION ENDPOINTS
// ==========================================

/**
 * POST /api/auth/login
 * Body: { identifier, password }
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
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

    // Sign session JWT
    const payload = {
      userId: user.id || (user._id ? user._id.toString() : undefined),
      email: user.email,
      role: user.role,
      studentId: user.studentRef || null,
      name: user.name,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    // Set secure httpOnly cookie
    setAuthCookie(res, token);

    res.json({
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
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

/**
 * POST /api/auth/logout
 */
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Successfully signed out.' });
});

/**
 * GET /api/auth/me
 */
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: req.user,
  });
});

// ==========================================
// 3. STUDENT SELF-SERVICE ROUTE
// ==========================================

/**
 * GET /api/student/me
 * Restricted to role === "student".
 * Strictly resolves using decoded studentId from verified JWT token.
 */
app.get('/api/student/me', requireAuth, requireRole('student'), async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.studentId;
  if (!studentId) {
    return res.status(403).json({ error: 'No student reference associated with this account.' });
  }

  try {
    const student = await Student.findOne({ id: studentId });
    if (!student) {
      return res.status(404).json({ error: `Student profile "${studentId}" not found.` });
    }
    res.json(student);
  } catch (err: any) {
    console.error('Failed to query student profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. TEACHER-GUARDED STUDENT ENDPOINTS
// ==========================================

// Teacher Profile
app.get('/api/teacher', (_req: Request, res: Response) => {
  res.json({
    id: 'TCH-01',
    name: 'Dr. Eleanor Vance',
    email: 'e.vance@school.edu',
  });
});

// Get All Students (Roster) - Teacher Only
app.get('/api/students', requireAuth, requireRole('teacher'), async (_req: Request, res: Response) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.json(students);
  } catch (err: any) {
    console.error('Failed to query students:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get Single Student by ID - Teacher Only
app.get('/api/students/:id', requireAuth, requireRole('teacher'), async (req: Request, res: Response) => {
  try {
    const student = await Student.findOne({ id: req.params.id });
    if (!student) {
      return res.status(404).json({ error: `Student "${req.params.id}" not found` });
    }
    res.json(student);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create New Student - Teacher Only
app.post('/api/students', requireAuth, requireRole('teacher'), async (req: Request, res: Response) => {
  try {
    const newStudent = req.body;
    if (!newStudent.id || !newStudent.name) {
      return res.status(400).json({ error: 'Missing required student fields (id, name)' });
    }

    const existing = await Student.findOne({ id: newStudent.id });
    if (existing) {
      return res.status(409).json({ error: `Student with ID "${newStudent.id}" already exists.` });
    }

    const created = await Student.create(newStudent);

    // Automatically create student user account with default credentials
    const defaultPasswordHash = await bcrypt.hash('Student123!', 12);
    const studentEmail = (newStudent.email || `${newStudent.id.toLowerCase()}@student.school.edu`).toLowerCase();

    await User.updateOne(
      { email: studentEmail },
      {
        $set: {
          id: `USR-${newStudent.id}`,
          email: studentEmail,
          studentRef: newStudent.id,
          name: newStudent.name,
          role: 'student',
          passwordHash: defaultPasswordHash,
        },
      },
      { upsert: true }
    );

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Student by ID - Teacher Only
app.put('/api/students/:id', requireAuth, requireRole('teacher'), async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id;
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    delete updates._id;
    delete updates.id;

    const updated = await Student.findOneAndUpdate(
      { id: studentId },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: `Student "${studentId}" not found` });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Student by ID - Teacher Only
app.delete('/api/students/:id', requireAuth, requireRole('teacher'), async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id;
    const result = await Student.deleteOne({ id: studentId });
    await User.deleteOne({ studentRef: studentId });
    console.log(`[API DELETE] Removed student "${studentId}", deletedCount: ${result.deletedCount}`);
    res.json({ success: true, id: studentId, deletedCount: result.deletedCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk Import / Upsert Students - Teacher Only
app.post('/api/students/import', requireAuth, requireRole('teacher'), async (req: Request, res: Response) => {
  try {
    const incomingStudents = req.body;
    if (!Array.isArray(incomingStudents) || incomingStudents.length === 0) {
      return res.status(400).json({ error: 'Expected non-empty array of students' });
    }

    const defaultPasswordHash = await bcrypt.hash('Student123!', 12);
    let upsertedCount = 0;
    let modifiedCount = 0;

    for (const s of incomingStudents) {
      const doc = { ...s };
      delete doc._id;
      const resOp = await Student.updateOne(
        { id: s.id },
        { $set: doc },
        { upsert: true }
      );
      if (resOp.upsertedCount) upsertedCount++;
      if (resOp.modifiedCount) modifiedCount++;

      // Ensure user account exists
      const email = (s.email || `${s.id.toLowerCase()}@student.school.edu`).toLowerCase();
      await User.updateOne(
        { studentRef: s.id },
        {
          $setOnInsert: {
            id: `USR-${s.id}`,
            email,
            studentRef: s.id,
            name: s.name,
            role: 'student',
            passwordHash: defaultPasswordHash,
          },
        },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      upsertedCount,
      modifiedCount,
      matchedCount: incomingStudents.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reset Collection to Initial Seed Dataset - Teacher Only
app.post('/api/reset', requireAuth, requireRole('teacher'), async (_req: Request, res: Response) => {
  try {
    const seedData = getInitialSeedData();

    if (seedData.length === 0) {
      return res.status(500).json({ error: 'seedData.json not found' });
    }

    await Student.deleteMany({});
    await Student.insertMany(seedData);
    res.json({ success: true, count: seedData.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start local dev server if not in Vercel serverless environment
if (!process.env.VERCEL) {
  connectToDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`[Express + Mongoose] Secure Auth & Student API listening at http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('[Startup Error] Failed to connect to MongoDB:', err);
    });
}

export default app;
