import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User';
import { Student } from '../models/Student';
import { getInitialSeedData } from './seedLoader';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'student_data_manager';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

let isInitialized = false;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  if (cached!.conn && mongoose.connection.readyState === 1) {
    if (!isInitialized) {
      await autoSeedIfEmpty();
      isInitialized = true;
    }
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log(`[Mongoose] Connected to MongoDB Atlas ("${DB_NAME}")`);
      return m;
    });
  }

  try {
    cached!.conn = await cached!.promise;
    if (!isInitialized) {
      await autoSeedIfEmpty();
      isInitialized = true;
    }
  } catch (err: any) {
    cached!.promise = null;
    console.error('[Mongoose Connection Error]:', err.message);
    throw err;
  }

  return cached!.conn;
}

export async function autoSeedIfEmpty() {
  try {
    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      console.log('[Mongoose Seeding] Populating students collection with initial data...');
      const seedData = getInitialSeedData();

      if (seedData.length > 0) {
        await Student.insertMany(seedData);
        console.log(`[Mongoose Seeding] Inserted ${seedData.length} students.`);
      }
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Mongoose Seeding] Generating user credentials for faculty and students...');

      // 1. Teacher account
      const teacherPasswordHash = await bcrypt.hash('Teacher123!', 12);
      await User.updateOne(
        { email: 'e.vance@school.edu' },
        {
          $set: {
            id: 'USR-TCH-01',
            email: 'e.vance@school.edu',
            name: 'Dr. Eleanor Vance',
            role: 'teacher',
            passwordHash: teacherPasswordHash,
          },
        },
        { upsert: true }
      );

      // 2. Student accounts
      const allStudents = await Student.find({}, 'id name email');
      const studentPasswordHash = await bcrypt.hash('Student123!', 12);

      for (const student of allStudents) {
        await User.updateOne(
          { email: student.email.toLowerCase() },
          {
            $set: {
              id: `USR-${student.id}`,
              email: student.email.toLowerCase(),
              studentRef: student.id,
              name: student.name,
              role: 'student',
              passwordHash: studentPasswordHash,
            },
          },
          { upsert: true }
        );
      }

      console.log(`[Mongoose Seeding] User accounts initialized (1 teacher, ${allStudents.length} students).`);
    }
  } catch (err: any) {
    console.error('[Mongoose AutoSeed Error]:', err.message);
  }
}

export async function getDbHealth() {
  let isConnected = false;
  let studentCount = 0;
  let userCount = 0;
  let error: string | null = null;

  try {
    await connectToDatabase();
    isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      studentCount = await Student.countDocuments();
      userCount = await User.countDocuments();
    }
  } catch (err: any) {
    isConnected = false;
    error = err.message;
  }

  return {
    isConnected,
    database: DB_NAME,
    studentCount,
    userCount,
    error,
  };
}
