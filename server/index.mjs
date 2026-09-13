import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  connectToDatabase,
  getStudentsCollection,
  getUsersCollection,
  getDbHealth,
} from './db.mjs';
import { requireAuth, requireRole } from './middleware/auth.mjs';

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

app.use((req, res, next) => {
  console.log(`[API ${req.method}] ${req.url}`);
  next();
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findUserByIdentifier(usersCol, rawIdentifier) {
  if (!rawIdentifier) return null;
  const trimmed = rawIdentifier.trim();
  const lower = trimmed.toLowerCase();
  const upper = trimmed.toUpperCase();

  // 1. Direct email, studentRef, or user id match
  let user = await usersCol.findOne({
    $or: [
      { email: lower },
      { studentRef: upper },
      { studentRef: trimmed },
      { id: upper },
      { id: trimmed },
    ],
  }, { projection: { _id: 0, id: 1, email: 1, name: 1, role: 1, studentRef: 1, passwordHash: 1 } });
  if (user) return user;

  // 2. Normalized student ID: e.g. "STU1001", "stu1001", or "1001" -> "STU-1001"
  const digitsMatch = trimmed.match(/\d{4}/);
  if (digitsMatch) {
    const formattedId = `STU-${digitsMatch[0]}`;
    user = await usersCol.findOne({
      $or: [
        { studentRef: formattedId },
        { id: `USR-${formattedId}` },
      ],
    }, { projection: { _id: 0, id: 1, email: 1, name: 1, role: 1, studentRef: 1, passwordHash: 1 } });
    if (user) return user;
  }

  return null;
}

// ==========================================
// 1. PUBLIC HEALTH & MONITORING
// ==========================================
app.get('/api/health', async (req, res) => {
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
 * Supports email or Student ID.
 */
app.post('/api/auth/login', async (req, res) => {
  const usersCol = getUsersCollection();
  if (!usersCol) {
    return res.status(503).json({ error: 'Database service unavailable' });
  }

  const { identifier, password } = req.body || {};

  if (!identifier || !password) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  try {
    const user = await findUserByIdentifier(usersCol, identifier);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = Boolean(user.passwordHash) && await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Sign session JWT
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      studentId: user.studentRef || null,
      name: user.name,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    // Set secure httpOnly cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    res.json({
      success: true,
      user: {
        userId: user.id,
        email: user.email,
        role: user.role,
        studentId: user.studentRef || null,
        name: user.name,
      },
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

/**
 * POST /api/auth/logout
 * Clears the session cookie
 */
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  res.json({ success: true, message: 'Successfully signed out.' });
});

/**
 * GET /api/auth/me
 * Validates session cookie and returns current user profile
 */
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({
    user: req.user,
  });
});

// ==========================================
// 3. STUDENT SELF-SERVICE ROUTE (§3.4)
// ==========================================

/**
 * GET /api/student/me
 * Restricted to role === "student".
 * Resolves exclusively using decoded studentId from verified JWT.
 */
app.get('/api/student/me', requireAuth, requireRole('student'), async (req, res) => {
  const col = getStudentsCollection();
  if (!col) {
    return res.status(503).json({ error: 'Database service unavailable' });
  }

  const studentId = req.user.studentId;
  if (!studentId) {
    return res.status(403).json({ error: 'No student reference associated with this account.' });
  }

  try {
    const student = await col.findOne({ id: studentId }, { projection: { _id: 0 } });
    if (!student) {
      return res.status(404).json({ error: `Student profile "${studentId}" not found.` });
    }
    res.json(student);
  } catch (err) {
    console.error('Failed to query student profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. TEACHER-GUARDED STUDENT ENDPOINTS (§3.4)
// ==========================================

// Teacher Profile
app.get('/api/teacher', (req, res) => {
  res.json({
    id: 'TCH-01',
    name: 'Dr. Eleanor Vance',
    email: 'e.vance@school.edu',
  });
});

// Get All Students (Roster) - Teacher Only
app.get('/api/students', requireAuth, requireRole('teacher'), async (req, res) => {
  const col = getStudentsCollection();
  if (!col) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  try {
    const students = await col
      .find({}, { projection: { _id: 0 } })
      .sort({ name: 1 })
      .toArray();
    res.json(students);
  } catch (err) {
    console.error('Failed to query students:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get Single Student by ID - Teacher Only
app.get('/api/students/:id', requireAuth, requireRole('teacher'), async (req, res) => {
  const col = getStudentsCollection();
  if (!col) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  try {
    const student = await col.findOne(
      { id: req.params.id },
      { projection: { _id: 0 } }
    );
    if (!student) {
      return res.status(404).json({ error: `Student "${req.params.id}" not found` });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create New Student - Teacher Only
app.post('/api/students', requireAuth, requireRole('teacher'), async (req, res) => {
  const col = getStudentsCollection();
  const usersCol = getUsersCollection();
  if (!col || !usersCol) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  try {
    const newStudent = req.body;
    if (!newStudent.id || !newStudent.name) {
      return res.status(400).json({ error: 'Missing required student fields (id, name)' });
    }

    const existing = await col.findOne({ id: newStudent.id });
    if (existing) {
      return res.status(409).json({ error: `Student with ID "${newStudent.id}" already exists.` });
    }

    await col.insertOne({ ...newStudent });

    // Automatically create student user account with default credentials
    const defaultPasswordHash = await bcrypt.hash('Student123!', 10);
    const studentUser = {
      id: `USR-${newStudent.id}`,
      email: (newStudent.email || `${newStudent.id.toLowerCase()}@student.school.edu`).toLowerCase(),
      studentRef: newStudent.id,
      name: newStudent.name,
      role: 'student',
      passwordHash: defaultPasswordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await usersCol.updateOne(
      { email: studentUser.email },
      { $set: studentUser },
      { upsert: true }
    );

    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Student by ID - Teacher Only
app.put('/api/students/:id', requireAuth, requireRole('teacher'), async (req, res) => {
  const col = getStudentsCollection();
  if (!col) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  try {
    const studentId = req.params.id;
    const updates = req.body;

    delete updates._id;
    delete updates.id;

    const result = await col.findOneAndUpdate(
      { id: studentId },
      { $set: { ...updates, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after', projection: { _id: 0 } }
    );

    if (!result) {
      return res.status(404).json({ error: `Student "${studentId}" not found` });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Student by ID - Teacher Only
app.delete('/api/students/:id', requireAuth, requireRole('teacher'), async (req, res) => {
  const col = getStudentsCollection();
  const usersCol = getUsersCollection();
  if (!col) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  try {
    const studentId = req.params.id;
    const result = await col.deleteOne({ id: studentId });
    if (usersCol) {
      await usersCol.deleteOne({ studentRef: studentId });
    }
    console.log(`[API DELETE] Removed student "${studentId}", deletedCount: ${result.deletedCount}`);
    res.json({ success: true, id: studentId, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk Import / Upsert Students - Teacher Only
app.post('/api/students/import', requireAuth, requireRole('teacher'), async (req, res) => {
  const col = getStudentsCollection();
  const usersCol = getUsersCollection();
  if (!col) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  try {
    const incomingStudents = req.body;
    if (!Array.isArray(incomingStudents) || incomingStudents.length === 0) {
      return res.status(400).json({ error: 'Expected non-empty array of students' });
    }

    const operations = incomingStudents.map((s) => {
      const doc = { ...s };
      delete doc._id;
      return {
        updateOne: {
          filter: { id: s.id },
          update: { $set: doc },
          upsert: true,
        },
      };
    });

    const result = await col.bulkWrite(operations);

    // Ensure student accounts exist for newly imported students
    if (usersCol) {
      const defaultPasswordHash = await bcrypt.hash('Student123!', 12);
      for (const s of incomingStudents) {
        await usersCol.updateOne(
          { studentRef: s.id },
          {
            $setOnInsert: {
              id: `USR-${s.id}`,
              email: (s.email || `${s.id.toLowerCase()}@student.school.edu`).toLowerCase(),
              studentRef: s.id,
              name: s.name,
              role: 'student',
              passwordHash: defaultPasswordHash,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          { upsert: true }
        );
      }
    }

    res.json({
      success: true,
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset Collection to Initial Seed Dataset - Teacher Only
app.post('/api/reset', requireAuth, requireRole('teacher'), async (req, res) => {
  const col = getStudentsCollection();
  if (!col) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  try {
    const seedFilePath = path.join(__dirname, 'seedData.json');
    if (!fs.existsSync(seedFilePath)) {
      return res.status(500).json({ error: 'seedData.json not found' });
    }
    const raw = fs.readFileSync(seedFilePath, 'utf-8');
    const seedData = JSON.parse(raw);

    await col.deleteMany({});
    await col.insertMany(seedData);
    res.json({ success: true, count: seedData.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server and connect to MongoDB Atlas
async function startServer() {
  await connectToDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Express] Secure Auth & Student API running at http://localhost:${PORT}`);
  });
}

startServer();
