import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { ToastProvider } from './context/ToastContext';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './components/auth/LoginPage';
import { TeacherDashboardPage } from './components/teacher/TeacherDashboardPage';
import { StudentRosterPage } from './components/teacher/StudentRosterPage';
import { StudentDetailPage } from './components/teacher/StudentDetailPage';
import {
  StudentDashboardPage,
  StudentDashboardTab,
} from './components/student/StudentDashboardPage';

interface MainViewProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const MainRouter: React.FC<MainViewProps> = ({ activeView, setActiveView }) => {
  const { state } = useAppState();
  const { user } = useAuth();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('studentId');
    }
    return null;
  });

  const isTeacher = user ? user.role === 'teacher' : state.currentRole === 'teacher';

  /* =========================================
     1. TEACHER ROUTES (§2.2)
     ========================================= */
  if (isTeacher) {
    if (activeView === 'detail') {
      const targetId = selectedStudentId || state.students[0]?.id || '';
      return (
        <StudentDetailPage
          studentId={targetId}
          onBack={() => {
            setSelectedStudentId(null);
            setActiveView('roster');
          }}
        />
      );
    }

    if (activeView === 'overview') {
      return (
        <TeacherDashboardPage
          onNavigateToRoster={() => setActiveView('roster')}
          onSelectStudent={(studentId) => {
            setSelectedStudentId(studentId);
            setActiveView('detail');
          }}
        />
      );
    }

    if (activeView === 'roster') {
      return (
        <StudentRosterPage
          onSelectStudent={(studentId) => {
            setSelectedStudentId(studentId);
            setActiveView('detail');
          }}
        />
      );
    }
  }

  /* =========================================
     2. STUDENT ROUTES (§2.3)
     ========================================= */
  const studentTab: StudentDashboardTab =
    activeView === 'grades'
      ? 'grades'
      : activeView === 'attendance'
      ? 'attendance'
      : activeView === 'feedback'
      ? 'feedback'
      : 'overview';

  const resolvedStudentId = user?.studentId || state.currentStudentId || '';

  return (
    <StudentDashboardPage
      key={`${resolvedStudentId}-${studentTab}`}
      initialTab={studentTab}
    />
  );
};

const AppRoot: React.FC = () => {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { setRole } = useAppState();

  // Sync authenticated session role and student reference into AppState
  useEffect(() => {
    if (user) {
      setRole(user.role, user.studentId || null);
    }
  }, [user, setRole]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-text-primary">
        <div className="w-9 h-9 border-2 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-text-muted">Authenticating active session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppShell>
      {({ activeView, setActiveView }) => (
        <MainRouter activeView={activeView} setActiveView={setActiveView} />
      )}
    </AppShell>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppStateProvider>
        <ToastProvider>
          <AppRoot />
        </ToastProvider>
      </AppStateProvider>
    </AuthProvider>
  );
};

export default App;
