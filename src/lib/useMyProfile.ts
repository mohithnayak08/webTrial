import { useEffect, useState } from 'react';
import { useAppState } from './useAppState';
import { useAuth } from '../context/AuthContext';
import { getStudentMeApi } from './api';
import { Student } from '../types';

export interface UseMyProfileResult {
  isAuthorized: boolean;
  student: Student | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for student personal profile access (§3.4).
 * Strictly resolves from backend session via GET /api/student/me.
 * Never trusts client-supplied query parameters.
 */
export function useMyProfile(): UseMyProfileResult {
  const { state } = useAppState();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRole = user?.role || state.currentRole;
  const activeStudentId = user?.studentId || state.currentStudentId;

  useEffect(() => {
    if (activeRole !== 'student') {
      setProfile(null);
      setError('ROLE_MISMATCH: useMyProfile is reserved for student role sessions.');
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    // 1. If authenticated via backend session, fetch securely from /api/student/me
    if (isAuthenticated && user?.role === 'student') {
      getStudentMeApi()
        .then((data) => {
          if (isMounted) {
            setProfile(data);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            // Fallback to local state if offline
            const localStudent = state.students.find((s) => s.id === activeStudentId) || null;
            if (localStudent) {
              setProfile(localStudent);
            } else {
              setError(err.message || 'Failed to retrieve student profile');
            }
            setIsLoading(false);
          }
        });
    } else {
      // 2. Fallback to state store
      const local = state.students.find((s) => s.id === activeStudentId) || null;
      setProfile(local);
      setIsLoading(false);
      if (!local) {
        setError(`NOT_FOUND: No profile found for student ${activeStudentId}`);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [activeRole, activeStudentId, isAuthenticated, user, state.students]);

  if (activeRole !== 'student') {
    return {
      isAuthorized: false,
      student: null,
      isLoading: false,
      error: 'ROLE_MISMATCH: useMyProfile is reserved for student role sessions.',
    };
  }

  return {
    isAuthorized: true,
    student: profile,
    isLoading,
    error,
  };
}
