import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase, getStudentsCollection, getDbHealth } from './db.mjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  console.log(`[API ${req.method}] ${req.url}`);
  next();
});

// Initial teacher identity
const teacherProfile = {
  id: 'TCH-01',
  name: 'Dr. Eleanor Vance',
  email: 'e.vance@school.edu',
};

// 1. Health & Connection Check
app.get('/api/health', async (req, res) => {
  const health = await getDbHealth();
  res.json({
    status: health.isConnected ? 'connected' : 'disconnected',
    ...health,
  });
});

// 2. Teacher Profile
app.get('/api/teacher', (req, res) => {
  res.json(teacherProfile);
});

// 3. Get All Students
app.get('/api/students', async (req, res) => {
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

// 4. Get Single Student by ID
app.get('/api/students/:id', async (req, res) => {
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

// 5. Create New Student
app.post('/api/students', async (req, res) => {
  const col = getStudentsCollection();
  if (!col) {
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
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Update Student by ID
app.put('/api/students/:id', async (req, res) => {
  const col = getStudentsCollection();
  if (!col) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  try {
    const studentId = req.params.id;
    const updates = req.body;

    // Disallow altering unique id field
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

// 7. Delete Student by ID
app.delete('/api/students/:id', async (req, res) => {
  const col = getStudentsCollection();
  if (!col) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  try {
    const studentId = req.params.id;
    const result = await col.deleteOne({ id: studentId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: `Student "${studentId}" not found` });
    }
    res.json({ success: true, id: studentId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Bulk Import / Upsert Students
app.post('/api/students/import', async (req, res) => {
  const col = getStudentsCollection();
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

// 9. Reset Collection to Initial Seed Dataset
app.post('/api/reset', async (req, res) => {
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
  app.listen(PORT, () => {
    console.log(`[Express] Backend API running at http://localhost:${PORT}`);
  });
}

startServer();
