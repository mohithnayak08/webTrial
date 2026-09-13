import { Student } from '../types';

export interface DbHealthStatus {
  status: 'connected' | 'disconnected';
  isConnected: boolean;
  database: string;
  studentCount: number;
  error?: string | null;
}

const API_BASE = '/api';

export async function checkDbHealth(): Promise<DbHealthStatus> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
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

export async function fetchStudentsFromDb(): Promise<Student[]> {
  const res = await fetch(`${API_BASE}/students`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Failed to fetch students: ${res.status}`);
  }
  return await res.json();
}

export async function fetchStudentByIdFromDb(id: string): Promise<Student> {
  const res = await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`);
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
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to reset database');
  }
  return await res.json();
}
