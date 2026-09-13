import { Student } from '../types';

export interface DbHealthStatus {
  status: 'connected' | 'disconnected';
  isConnected: boolean;
  database: string;
  studentCount: number;
  userCount?: number;
  error?: string | null;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: 'teacher' | 'student';
  studentId?: string | null;
  name: string;
}

const API_BASE = '/api';

// ==========================================
// 1. AUTHENTICATION CLIENT APIS
// ==========================================

export async function loginApi(
  identifier: string,
  password: string
): Promise<{ success: boolean; user: AuthUser }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ identifier, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Authentication failed');
  }

  return await res.json();
}

export async function logoutApi(): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'same-origin',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to log out');
  }

  return await res.json();
}

export async function getAuthMeApi(): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'same-origin',
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.user || null;
  } catch (err) {
    return null;
  }
}

export async function getStudentMeApi(): Promise<Student> {
  const res = await fetch(`${API_BASE}/student/me`, {
    credentials: 'same-origin',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to fetch personal student profile');
  }

  return await res.json();
}

// ==========================================
// 2. HEALTH & MONITORING
// ==========================================

export async function checkDbHealth(): Promise<DbHealthStatus> {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      credentials: 'same-origin',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    return {
      status: 'disconnected',
      isConnected: false,
      database: 'student_data_manager',
      studentCount: 0,
      error: err.message,
    };
  }
}

// ==========================================
// 3. STUDENT DIRECTORY (TEACHER RESTRICTED)
// ==========================================

export async function fetchStudentsFromDb(): Promise<Student[]> {
  const res = await fetch(`${API_BASE}/students`, {
    credentials: 'same-origin',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Failed to fetch students: ${res.status}`);
  }
  return await res.json();
}

export async function fetchStudentByIdFromDb(id: string): Promise<Student> {
  const res = await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`, {
    credentials: 'same-origin',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Failed to fetch student ${id}`);
  }
  return await res.json();
}

export async function createStudentInDb(student: Student): Promise<Student> {
  const res = await fetch(`${API_BASE}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(student),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Failed to create student ${student.id}`);
  }
  return await res.json();
}

export async function updateStudentInDb(
  id: string,
  updates: Partial<Student>
): Promise<Student> {
  const res = await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Failed to update student ${id}`);
  }
  return await res.json();
}

export async function deleteStudentFromDb(id: string): Promise<{ success: boolean; id: string }> {
  const res = await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Failed to delete student ${id}`);
  }
  return await res.json();
}

export async function importSpreadsheetStudentsToDb(
  students: Student[]
): Promise<{ success: boolean; upsertedCount: number; modifiedCount: number }> {
  const res = await fetch(`${API_BASE}/students/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(students),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to bulk import students');
  }
  return await res.json();
}

export async function resetDatabaseInDb(): Promise<{ success: boolean; count: number }> {
  const res = await fetch(`${API_BASE}/reset`, {
    method: 'POST',
    credentials: 'same-origin',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to reset database');
  }
  return await res.json();
}
