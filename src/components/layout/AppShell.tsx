import React, { useEffect, useState } from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { useAppState } from '../../lib/useAppState';

interface AppShellProps {
  children: (props: {
    activeView: string;
    setActiveView: (view: string) => void;
  }) => React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { state } = useAppState();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const v = new URLSearchParams(window.location.search).get('view');
      if (v) return v;
    }
    return state.currentRole === 'teacher' ? 'overview' : 'my-performance';
  });

  // Automatically adjust default active view when simulated role changes
  useEffect(() => {
    if (state.currentRole === 'teacher') {
      if (activeView === 'my-performance' || activeView === 'grades' || activeView === 'attendance' || activeView === 'feedback') {
        setActiveView('overview');
      }
    } else {
      if (activeView === 'overview' || activeView === 'roster' || activeView === 'detail') {
        setActiveView('my-performance');
      }
    }
  }, [state.currentRole, activeView]);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col font-sans selection:bg-accent-primary/20 selection:text-white">
      {/* Topbar: Fixed at top with RoleSwitcher & UserChip */}
      <Topbar
        onToggleMobileSidebar={toggleMobileSidebar}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main Structural Layout: Responsive Sidebar + Content */}
      <div className="flex-1 flex w-full">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={closeMobileSidebar}
          activeView={activeView}
          onSelectView={setActiveView}
        />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 min-w-0 bg-bg-base overflow-y-auto min-h-[calc(100vh-3.5rem)]">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
            {children({ activeView, setActiveView })}
          </div>
        </main>
      </div>
    </div>
  );
};
