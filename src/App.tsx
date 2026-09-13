import React from 'react';
import { AppShell } from './components/layout/AppShell';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { ToastProvider } from './context/ToastContext';
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

  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('studentId');
    }
    return null;
  });

  const isTeacher = state.currentRole === 'teacher';

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

  return (
    <StudentDashboardPage
      key={`${state.currentStudentId}-${studentTab}`}
      initialTab={studentTab}
    />
  );
};

export const App: React.FC = () => {
  return (
    <AppStateProvider>
      <ToastProvider>
        <AppShell>
          {({ activeView, setActiveView }) => (
            <MainRouter activeView={activeView} setActiveView={setActiveView} />
          )}
        </AppShell>
      </ToastProvider>
    </AppStateProvider>
  );
};

export default App;
