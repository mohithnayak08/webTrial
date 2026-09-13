import { useAppState } from './useAppState';
import { Student } from '../types';

export interface UseStudentsResult {
  isAuthorized: boolean;
  students: Student[];
  error: string | null;
}

/**
 * Hook for teacher-only access to student records (§3.4).
 * Strictly guards against student role access.
 */
export function useStudents(): UseStudentsResult {
  const { state } = useAppState();

  if (state.currentRole !== 'teacher') {
    return {
      isAuthorized: false,
      students: [],
      error: 'ACCESS_DENIED: Student role is not authorized to access student roster data.',
    };
  }

  return {
    isAuthorized: true,
    students: state.students,
    error: null,
  };
}
