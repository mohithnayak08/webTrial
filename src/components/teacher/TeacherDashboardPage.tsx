import React, { useMemo } from 'react';
import { useAppState } from '../../lib/useAppState';
import { StatCard } from './StatCard';
import { RecentActivityList } from './RecentActivityList';
import {
  Users,
  CalendarCheck,
  GraduationCap,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface TeacherDashboardPageProps {
  onNavigateToRoster: () => void;
  onSelectStudent?: (studentId: string) => void;
}

export const TeacherDashboardPage: React.FC<TeacherDashboardPageProps> = ({
  onNavigateToRoster,
  onSelectStudent,
}) => {
  const { state } = useAppState();
  const students = state.students;

  // Compute aggregate metrics
  const aggregates = useMemo(() => {
    if (students.length === 0) {
      return {
        total: 0,
        avgAttendance: 0,
        avgGpa: 0,
        atRiskCount: 0,
        atRiskStudents: [],
        goodCount: 0,
        warningCount: 0,
        sections: {},
      };
    }

    const totalAttendance = students.reduce((sum, s) => sum + s.attendancePct, 0);
    const totalGpa = students.reduce((sum, s) => sum + s.gpa, 0);
    const atRisk = students.filter((s) => s.status === 'critical');
    const good = students.filter((s) => s.status === 'good');
    const warning = students.filter((s) => s.status === 'warning');

    // Section breakdown
    const sections: Record<
      string,
      { count: number; totalGpa: number; totalAtt: number; criticalCount: number }
    > = {};

    for (const s of students) {
      if (!sections[s.section]) {
        sections[s.section] = { count: 0, totalGpa: 0, totalAtt: 0, criticalCount: 0 };
      }
      sections[s.section].count += 1;
      sections[s.section].totalGpa += s.gpa;
      sections[s.section].totalAtt += s.attendancePct;
      if (s.status === 'critical') {
        sections[s.section].criticalCount += 1;
      }
    }

    return {
      total: students.length,
      avgAttendance: Number((totalAttendance / students.length).toFixed(1)),
      avgGpa: Number((totalGpa / students.length).toFixed(2)),
      atRiskCount: atRisk.length,
      atRiskStudents: atRisk,
      goodCount: good.length,
      warningCount: warning.length,
      sections,
    };
  }, [students]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-accent-primary font-mono font-medium">
              Teacher Console
            </span>
            <span className="text-text-muted text-xs">•</span>
            <span className="text-xs text-text-muted">Overview Dashboard</span>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Academic Performance Overview
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Aggregated cohort telemetry across {aggregates.total} enrolled students.
          </p>
        </div>

        {/* Header Action Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateToRoster}
            className="px-3.5 py-2 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Users size={14} />
            <span>Manage Student Roster</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Aggregate StatCards Grid (§2.2 & §4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card 1: Total Students */}
        <StatCard
          label="Total Students"
          value={aggregates.total}
          icon={Users}
          badge={{
            text: `${Object.keys(aggregates.sections).length} Sections`,
            tone: 'info',
          }}
          footnote="Active enrollees"
          onClick={onNavigateToRoster}
        />

        {/* Card 2: Average Attendance % */}
        <StatCard
          label="Cohort Attendance"
          value={`${aggregates.avgAttendance}%`}
          icon={CalendarCheck}
          badge={{
            text: aggregates.avgAttendance >= 90 ? 'Good Standing' : 'Below Target (<90%)',
            tone: aggregates.avgAttendance >= 90 ? 'success' : 'warning',
            icon: aggregates.avgAttendance >= 90 ? CheckCircle2 : AlertTriangle,
          }}
          footnote="Excused days excluded (§3.6)"
        />

        {/* Card 3: Average GPA */}
        <StatCard
          label="Average GPA"
          value={aggregates.avgGpa.toFixed(2)}
          subValue="/ 4.00"
          icon={GraduationCap}
          badge={{
            text: aggregates.avgGpa >= 3.0 ? 'Honors Band' : 'General Band',
            tone: aggregates.avgGpa >= 3.0 ? 'success' : 'neutral',
            icon: TrendingUp,
          }}
          footnote="Standardized 4.0 scale"
        />

        {/* Card 4: At-Risk Count */}
        <StatCard
          label="At-Risk Students"
          value={aggregates.atRiskCount}
          icon={AlertOctagon}
          badge={{
            text: `${aggregates.atRiskCount} Critical Cases`,
            tone: 'danger',
            icon: AlertOctagon,
          }}
          footnote="Attendance < 75% or GPA < 2.0"
          onClick={onNavigateToRoster}
        />
      </div>

      {/* At-Risk Intervention Alert Banner */}
      {aggregates.atRiskCount > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertOctagon size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-rose-400 flex items-center gap-2">
                <span>Immediate Academic Intervention Recommended</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
                  {aggregates.atRiskCount} Flagged
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {aggregates.atRiskStudents.map((s) => s.name).join(', ')} currently breach attendance or academic minimums.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToRoster}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <span>Review in Roster</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Section Cohort Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(aggregates.sections).map(([sectionName, stats]) => {
          const secAvgGpa = (stats.totalGpa / stats.count).toFixed(2);
          const secAvgAtt = (stats.totalAtt / stats.count).toFixed(1);

          return (
            <div
              key={sectionName}
              className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-bg-surface-raised border border-border-subtle flex items-center justify-center text-text-secondary">
                    <Building2 size={16} className="text-accent-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {sectionName}
                    </h3>
                    <p className="text-[11px] text-text-muted font-mono">
                      {stats.count} students enrolled
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    stats.criticalCount === 0
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {stats.criticalCount === 0
                    ? 'All Good/Warning'
                    : `${stats.criticalCount} At-Risk`}
                </span>
              </div>

              {/* Progress metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-bg-base border border-border-subtle">
                  <div className="text-text-muted text-[11px]">Section GPA</div>
                  <div className="text-lg font-bold font-sans tabular-nums text-text-primary mt-0.5">
                    {secAvgGpa}{' '}
                    <span className="text-xs text-text-muted font-normal">/ 4.00</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-bg-base border border-border-subtle">
                  <div className="text-text-muted text-[11px]">Section Attendance</div>
                  <div className="text-lg font-bold font-sans tabular-nums text-text-primary mt-0.5">
                    {secAvgAtt}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chronological Activity Feed (§2.2 & §4) */}
      <RecentActivityList
        students={students}
        onSelectStudent={onSelectStudent}
      />
    </div>
  );
};
