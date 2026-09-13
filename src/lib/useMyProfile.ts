import { useAppState } from './useAppState';
import { Student } from '../types';

export interface UseMyProfileResult {
  isAuthorized: boolean;
  student: Student | null;
  error: string | null;
}

/**
 * Hook for student personal profile access (§3.4).
 * Strictly resolves ONLY via state.currentStudentId.
 * Ignores any external input, guaranteeing privacy boundaries.
 */
export function useMyProfile(): UseMyProfileResult {
  const { state } = useAppState();

  if (state.currentRole !== 'student') {
    return {
      isAuthorized: false,
      student: null,
      error: 'ROLE_MISMATCH: useMyProfile is reserved for student role sessions.',
    };
  }

  if (!state.currentStudentId) {
    return {
      isAuthorized: false,
      student: null,
      error: 'NO_STUDENT_SESSION: No current student identity is active.',
    };
  }

  const profile = state.students.find((s) => s.id === state.currentStudentId) || null;

  if (!profile) {
    return {
      isAuthorized: false,
      student: null,
      error: `NOT_FOUND: Student record ${state.currentStudentId} does not exist.`,
    };
  }

  return {
    isAuthorized: true,
    student: profile,
    error: null,
  };
}
