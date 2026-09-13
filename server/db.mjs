import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_URI = 'mongodb+srv://nn25cce031_db_user:dcag0O9upR0D6SZU@cluster0.5f2dtwa.mongodb.net/student_data_manager?retryWrites=true&w=majority';
const uri = process.env.MONGODB_URI || DEFAULT_URI;
const dbName = process.env.DB_NAME || 'student_data_manager';

let client = null;
let db = null;
let isConnected = false;
let connectionError = null;

export async function connectToDatabase() {
  if (uri.includes('<db_username>')) {
    const msg = 'MONGODB_URI contains placeholder <db_username>. Please update your .env file with your Atlas username.';
    console.warn(`[MongoDB Warning] ${msg}`);
    connectionError = msg;
    isConnected = false;
    return null;
  }

  try {
    if (!client) {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000,
      });
    }

    await client.connect();
    db = client.db(dbName);
    isConnected = true;
    connectionError = null;
    console.log(`[MongoDB] Connected successfully to Atlas database: "${dbName}"`);

    // Ensure indexes and auto-seed if empty
    await autoSeedIfEmpty();
    await autoSeedUsersIfEmpty();

    return db;
  } catch (err) {
    isConnected = false;
    connectionError = err.message;
    console.error('[MongoDB Error] Failed to connect to Atlas:', err.message);
    return null;
  }
}

async function autoSeedIfEmpty() {
  if (!db) return;
  try {
    const studentsCol = db.collection('students');
    const metaCol = db.collection('system_meta');
    await studentsCol.createIndex({ id: 1 }, { unique: true });

    const meta = await metaCol.findOne({ key: 'is_seeded' });
    if (!meta) {
      const count = await studentsCol.countDocuments();
      if (count > 0) {
        await metaCol.insertOne({
          key: 'is_seeded',
          value: true,
          seededAt: new Date().toISOString(),
        });
        console.log(`[MongoDB] Database already contains ${count} records. Marked as initialized.`);
      } else {
        // First-time installation: seed default 12 students
        const seedFilePath = path.join(__dirname, 'seedData.json');
        if (fs.existsSync(seedFilePath)) {
          const raw = fs.readFileSync(seedFilePath, 'utf-8');
          const seedData = JSON.parse(raw);
          if (Array.isArray(seedData) && seedData.length > 0) {
            await studentsCol.insertMany(seedData);
            await metaCol.insertOne({
              key: 'is_seeded',
              value: true,
              seededAt: new Date().toISOString(),
            });
            console.log(`[MongoDB] Initial seed of collection "students" with ${seedData.length} records.`);
          }
        }
      }
    } else {
      const count = await studentsCol.countDocuments();
      console.log(`[MongoDB] Database initialized (${count} student records present).`);
    }
  } catch (err) {
    console.error('[MongoDB Seeding Error]:', err.message);
  }
}

async function autoSeedUsersIfEmpty() {
  if (!db) return;
  try {
    const usersCol = db.collection('users');
    const metaCol = db.collection('system_meta');

    // Create unique index on email and regular index on studentRef
    await usersCol.createIndex({ email: 1 }, { unique: true });
    await usersCol.createIndex({ studentRef: 1 });

    const meta = await metaCol.findOne({ key: 'users_seeded' });
    if (meta) {
      const userCount = await usersCol.countDocuments();
      console.log(`[MongoDB] Users collection initialized (${userCount} user accounts present).`);
      return;
    }

    console.log('[MongoDB Auth] Hashing credentials and seeding initial user accounts...');

    // 1. Seed Teacher account (Dr. Eleanor Vance)
    const teacherPasswordHash = await bcrypt.hash('Teacher123!', 10);
    const teacherUser = {
      id: 'USR-TCH-01',
      email: 'e.vance@school.edu',
      name: 'Dr. Eleanor Vance',
      role: 'teacher',
      passwordHash: teacherPasswordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await usersCol.updateOne(
      { email: teacherUser.email },
      { $set: teacherUser },
      { upsert: true }
    );

    // 2. Seed Student accounts from students collection
    const studentsCol = db.collection('students');
    const allStudents = await studentsCol.find({}, { projection: { id: 1, name: 1, email: 1 } }).toArray();

    const studentPasswordHash = await bcrypt.hash('Student123!', 10);

    for (const student of allStudents) {
      const studentUser = {
        id: `USR-${student.id}`,
        email: student.email.toLowerCase(),
        studentRef: student.id,
        name: student.name,
        role: 'student',
        passwordHash: studentPasswordHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await usersCol.updateOne(
        { email: studentUser.email },
        { $set: studentUser },
        { upsert: true }
      );
    }

    await metaCol.updateOne(
      { key: 'users_seeded' },
      { $set: { key: 'users_seeded', value: true, seededAt: new Date().toISOString() } },
      { upsert: true }
    );

    console.log(`[MongoDB Auth] Successfully seeded 1 teacher and ${allStudents.length} student user accounts.`);
  } catch (err) {
    console.error('[MongoDB Users Seeding Error]:', err.message);
  }
}

export function getDb() {
  return db;
}

export function getStudentsCollection() {
  if (!db) return null;
  return db.collection('students');
}

export function getUsersCollection() {
  if (!db) return null;
  return db.collection('users');
}

export async function getDbHealth() {
  let studentCount = 0;
  let userCount = 0;
  if (db && isConnected) {
    try {
      studentCount = await db.collection('students').countDocuments();
      userCount = await db.collection('users').countDocuments();
    } catch {
      isConnected = false;
    }
  }
  return {
    isConnected,
    database: dbName,
    studentCount,
    userCount,
    error: connectionError,
  };
}
