import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { initialAppState } from '../lib/mockData';
import { AppState, AppUiState, Student, StudentStatus, UserRole } from '../types';

import { checkDbHealth, fetchStudentsFromDb, resetDatabaseInDb } from '../lib/api';

const STORAGE_KEY = 'student-data-manager:v1';

export interface AppStateContextValue {
  state: AppState;
  isDbConnected: boolean;
  isLoadingDb: boolean;
  refreshFromDb: () => Promise<void>;
  setRole: (role: UserRole, studentId?: string | null) => void;
  setStudents: (
    updater: Student[] | ((prev: Student[]) => Student[]),
  ) => void;
  setUi: (
    updater: Partial<AppUiState> | ((prev: AppUiState) => AppUiState),
  ) => void;
  updateState: (updater: (prev: AppState) => AppState) => void;
  resetToDefaultState: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

function loadPersistedState(): AppState {
  if (typeof window === 'undefined') {
    return initialAppState;
  }
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const queryRole = urlParams.get('role');
    const queryStudentId = urlParams.get('studentId');

    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<AppState>) : null;

    const baseStudents =
      parsed && Array.isArray(parsed.students)
        ? parsed.students
        : initialAppState.students;

    const baseTeacher = parsed?.teacher || initialAppState.teacher;

    let role: UserRole = initialAppState.currentRole;
    if (queryRole === 'student' || queryRole === 'teacher') {
      role = queryRole;
    } else if (parsed?.currentRole === 'student' || parsed?.currentRole === 'teacher') {
      role = parsed.currentRole;
    }

    let studentId: string | null = null;
    if (role === 'student') {
      studentId =
        queryStudentId ||
        parsed?.currentStudentId ||
        baseStudents[0]?.id ||
        null;
    }

    const querySearch = urlParams.get('search');
    const queryStatus = urlParams.get('status') as StudentStatus | null;
    const queryGrade = urlParams.get('grade');

    return {
      currentRole: role,
      currentStudentId: studentId,
      teacher: baseTeacher,
      students: baseStudents,
      ui: {
        search: querySearch !== null ? querySearch : parsed?.ui?.search || '',
        filters: {
          gradeBand: queryGrade !== null ? queryGrade : parsed?.ui?.filters?.gradeBand || null,
          attendanceStatus:
            queryStatus !== null
              ? queryStatus
              : (parsed?.ui?.filters?.attendanceStatus as StudentStatus | null) || null,
        },
        sort: {
          column: parsed?.ui?.sort?.column || 'name',
          direction: parsed?.ui?.sort?.direction === 'desc' ? 'desc' : 'asc',
        },
      },
    };
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return initialAppState;
  }
}

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AppState>(() => loadPersistedState());
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  const refreshFromDb = useCallback(async () => {
    setIsLoadingDb(true);
    try {
      const health = await checkDbHealth();
      if (health.isConnected) {
        setIsDbConnected(true);
        const dbStudents = await fetchStudentsFromDb();
        if (Array.isArray(dbStudents)) {
          setState((prev) => ({
            ...prev,
            students: dbStudents,
          }));
        }
      } else {
        setIsDbConnected(false);
      }
    } catch (err) {
      console.warn('[AppState] MongoDB unreachable, using local storage fallback:', err);
      setIsDbConnected(false);
    } finally {
      setIsLoadingDb(false);
    }
  }, []);

  // Fetch initial student data from MongoDB Atlas on mount
  useEffect(() => {
    refreshFromDb();
  }, [refreshFromDb]);

  // Automatically synchronize state changes to localStorage as local cache
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to write state to localStorage:', err);
    }
  }, [state]);

  const setRole = useCallback((role: UserRole, studentId: string | null = null) => {
    setState((prev) => ({
      ...prev,
      currentRole: role,
      currentStudentId: role === 'student' ? studentId || prev.students[0]?.id || null : null,
    }));
  }, []);

  const setStudents = useCallback(
    (updater: Student[] | ((prev: Student[]) => Student[])) => {
      setState((prev) => ({
        ...prev,
        students: typeof updater === 'function' ? updater(prev.students) : updater,
      }));
    },
    [],
  );

  const setUi = useCallback(
    (updater: Partial<AppUiState> | ((prev: AppUiState) => AppUiState)) => {
      setState((prev) => {
        const nextUi =
          typeof updater === 'function' ? updater(prev.ui) : { ...prev.ui, ...updater };
        return {
          ...prev,
          ui: nextUi,
        };
      });
    },
    [],
  );

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState(updater);
  }, []);

  const resetToDefaultState = useCallback(async () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      if (isDbConnected) {
        await resetDatabaseInDb().catch((e) => console.error(e));
      }
    } catch (err) {
      console.error('Failed to clear state:', err);
    }
    setState(initialAppState);
  }, [isDbConnected]);

  return (
    <AppStateContext.Provider
      value={{
        state,
        isDbConnected,
        isLoadingDb,
        refreshFromDb,
        setRole,
        setStudents,
        setUi,
        updateState,
        resetToDefaultState,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return ctx;
}
