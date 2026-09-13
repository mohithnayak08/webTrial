import { useAppState } from './useAppState';
import { Student, Grade, AttendanceRecord } from '../types';
import { recalculateStudent } from './derived';
import {
  createStudentInDb,
  updateStudentInDb,
  deleteStudentFromDb,
  importSpreadsheetStudentsToDb,
} from './api';

export interface UseTeacherActionsResult {
  isAuthorized: boolean;
  addStudent: (student: Student) => boolean;
  updateStudent: (id: string, patches: Partial<Student>) => boolean;
  deleteStudent: (id: string) => boolean;
  importCsvStudents: (incoming: Student[]) => boolean;
  importSpreadsheetStudents: (incoming: Student[]) => boolean;
}

/**
 * Gatekeeper hook for all mutation actions (§3.4).
 * Returns operational functions if role === 'teacher', otherwise rejects with hard boundary block.
 */
export function useTeacherActions(): UseTeacherActionsResult {
  const { state, setStudents } = useAppState();
  const isAuthorized = state.currentRole === 'teacher';

  const addStudent = (newStudent: Student): boolean => {
    if (!isAuthorized) {
      console.error('MUTATION_BLOCKED: Only teachers can add student records.');
      return false;
    }
    const computed = recalculateStudent(newStudent);
    setStudents((prev) => [computed, ...prev]);

    createStudentInDb(computed).catch((err) => {
      console.error('[MongoDB Atlas Error] Failed to insert student:', err);
    });
    return true;
  };

  const updateStudent = (id: string, patches: Partial<Student>): boolean => {
    if (!isAuthorized) {
      console.error('MUTATION_BLOCKED: Only teachers can update student records.');
      return false;
    }
    let updatedMerged: Student | null = null;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const merged = { ...s, ...patches };
        updatedMerged = recalculateStudent(merged);
        return updatedMerged;
      }),
    );

    if (updatedMerged) {
      updateStudentInDb(id, updatedMerged).catch((err) => {
        console.error('[MongoDB Atlas Error] Failed to update student:', err);
      });
    }
    return true;
  };

  const deleteStudent = (id: string): boolean => {
    if (!isAuthorized) {
      console.error('MUTATION_BLOCKED: Only teachers can delete student records.');
      return false;
    }
    setStudents((prev) => prev.filter((s) => s.id !== id));

    deleteStudentFromDb(id).catch((err) => {
      console.error('[MongoDB Atlas Error] Failed to delete student:', err);
    });
    return true;
  };

  const importCsvStudents = (incoming: Student[]): boolean => {
    if (!isAuthorized) {
      console.error('MUTATION_BLOCKED: Only teachers can import spreadsheet records.');
      return false;
    }
    setStudents((prev) => {
      const studentMap = new Map<string, Student>();
      for (const s of prev) {
        studentMap.set(s.id, s);
      }
      for (const incomingStudent of incoming) {
        const existing = studentMap.get(incomingStudent.id);
        if (existing) {
          // Non-destructive merge of grades
          const mergedGradesMap = new Map<string, Grade>();
          for (const g of existing.grades) mergedGradesMap.set(g.subject, g);
          for (const g of incomingStudent.grades) mergedGradesMap.set(g.subject, g);

          // Non-destructive merge of attendance
          const mergedAttendanceMap = new Map<string, AttendanceRecord>();
          for (const a of existing.attendance) mergedAttendanceMap.set(a.date, a);
          for (const a of incomingStudent.attendance) mergedAttendanceMap.set(a.date, a);

          const merged: Student = {
            ...existing,
            ...incomingStudent,
            grades: Array.from(mergedGradesMap.values()),
            attendance: Array.from(mergedAttendanceMap.values()),
            feedback: existing.feedback,
          };
          studentMap.set(incomingStudent.id, recalculateStudent(merged));
        } else {
          studentMap.set(incomingStudent.id, recalculateStudent(incomingStudent));
        }
      }
      return Array.from(studentMap.values());
    });

    if (incoming.length > 0) {
      importSpreadsheetStudentsToDb(incoming).catch((err) => {
        console.error('[MongoDB Atlas Error] Failed to bulk upsert students:', err);
      });
    }
    return true;
  };

  const importSpreadsheetStudents = (incoming: Student[]): boolean => {
    return importCsvStudents(incoming);
  };

  return {
    isAuthorized,
    addStudent,
    updateStudent,
    deleteStudent,
    importCsvStudents,
    importSpreadsheetStudents,
  };
}
