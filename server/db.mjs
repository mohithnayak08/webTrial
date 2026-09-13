import { MongoClient } from 'mongodb';
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

    // Ensure index and auto-seed if empty
    await autoSeedIfEmpty();

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

export function getDb() {
  return db;
}

export function getStudentsCollection() {
  if (!db) return null;
  return db.collection('students');
}

export async function getDbHealth() {
  let studentCount = 0;
  if (db && isConnected) {
    try {
      studentCount = await db.collection('students').countDocuments();
    } catch {
      isConnected = false;
    }
  }
  return {
    isConnected,
    database: dbName,
    studentCount,
    error: connectionError,
  };
}
