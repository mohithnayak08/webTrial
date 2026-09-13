import React, { useState } from 'react';
import { AttendanceRecord, Grade, Student } from '../../types';
import {
  calculateAttendancePct,
  calculateGpa,
  deriveAvatarInitials,
  deriveStatus,
  scoreToLetter,
} from '../../lib/derived';
import { StatusBadge } from '../ui/StatusBadge';
import {
  Check,
  Calculator,
  User,
  BookOpen,
  CalendarCheck,
  AlertCircle,
} from 'lucide-react';

export interface StudentFormProps {
  initialData?: Student | null;
  existingStudents: Student[];
  onSubmit: (student: Student) => void;
  onCancel: () => void;
}

const DEFAULT_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'English',
  'Computer Science',
];

export const StudentForm: React.FC<StudentFormProps> = ({
  initialData,
  existingStudents,
  onSubmit,
  onCancel,
}) => {
  const isEdit = Boolean(initialData);

  // Suggest next ID if adding
  const suggestNextId = () => {
    const existingNums = existingStudents
      .map((s) => {
        const match = s.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 1000;
    return `STU-${maxNum + 1}`;
  };

  // Form states
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [id, setId] = useState(initialData?.id || suggestNextId());
  const [section, setSection] = useState(initialData?.section || 'Grade 10 - A');

  // Grades state: pre-fill or default 5 subjects
  const [grades, setGrades] = useState<Grade[]>(() => {
    if (initialData && initialData.grades.length > 0) {
      return initialData.grades;
    }
    return DEFAULT_SUBJECTS.map((sub) => ({
      subject: sub,
      score: 85,
      letter: 'B',
      remark: 'Standard curriculum evaluation',
      updatedAt: new Date().toISOString(),
    }));
  });

  // Attendance baseline percentage (0-100)
  const [attendancePercentage, setAttendancePercentage] = useState<number>(() => {
    if (initialData) {
      return initialData.attendancePct;
    }
    return 95;
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time derived calculations
  const liveGpa = calculateGpa(grades);
  const liveStatus = deriveStatus(liveGpa, attendancePercentage);

  const handleScoreChange = (index: number, newScoreVal: number) => {
    const clampedScore = Math.max(0, Math.min(100, isNaN(newScoreVal) ? 0 : newScoreVal));
    setGrades((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        score: clampedScore,
        letter: scoreToLetter(clampedScore),
        updatedAt: new Date().toISOString(),
      };
      return updated;
    });
  };

  const handleRemarkChange = (index: number, newRemark: string) => {
    setGrades((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        remark: newRemark,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Student full name is required.';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please provide a valid email format.';
    }

    if (!id.trim()) {
      errs.id = 'Student ID is required.';
    } else if (!isEdit) {
      const duplicate = existingStudents.some(
        (s) => s.id.toLowerCase() === id.trim().toLowerCase(),
      );
      if (duplicate) {
        errs.id = 'A student with this ID already exists.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Synthesize attendance records representing the desired percentage
    let attendanceRecords: AttendanceRecord[] = initialData?.attendance || [];
    if (!isEdit || attendanceRecords.length === 0) {
      const totalDays = 20;
      const presentDays = Math.round((attendancePercentage / 100) * totalDays);
      attendanceRecords = Array.from({ length: totalDays }, (_, i) => ({
        date: `2026-09-${String(i + 1).padStart(2, '0')}`,
        status: i < presentDays ? 'present' : 'absent',
      }));
    }

    const calculatedAttendance = calculateAttendancePct(attendanceRecords);
    const calculatedGpa = calculateGpa(grades);
    const calculatedStatus = deriveStatus(calculatedGpa, calculatedAttendance);
    const avatarInitials = deriveAvatarInitials(name);

    const studentRecord: Student = {
      id: id.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      section,
      avatarInitials,
      grades,
      gpa: calculatedGpa,
      attendance: attendanceRecords,
      attendancePct: calculatedAttendance,
      feedback: initialData?.feedback || [
        {
          id: `fb-init-${Date.now()}`,
          date: new Date().toISOString(),
          teacherId: 'TCH-01',
          teacherName: 'Dr. Eleanor Vance',
          message: isEdit ? 'Record updated.' : 'Enrolled into class roster.',
        },
      ],
      status: calculatedStatus,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(studentRecord);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {/* Real-time Derived Metric Preview (§3.6) */}
      <div className="p-4 rounded-xl bg-bg-base border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-text-muted">
          <Calculator size={15} className="text-accent-primary" />
          <span className="font-medium text-text-primary">Live Recalculation Preview:</span>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <span className="text-text-muted mr-1.5">GPA:</span>
            <span className="font-mono font-bold tabular-nums text-text-primary">
              {liveGpa.toFixed(2)} / 4.00
            </span>
          </div>

          <div>
            <span className="text-text-muted mr-1.5">Attendance:</span>
            <span className="font-mono font-bold tabular-nums text-text-primary">
              {attendancePercentage.toFixed(1)}%
            </span>
          </div>

          <StatusBadge status={liveStatus} />
        </div>
      </div>

      {/* Section 1: Basic Identity */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border-subtle font-semibold text-text-primary text-xs uppercase tracking-wider">
          <User size={14} className="text-accent-primary" />
          <span>Student Identification</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-text-secondary font-medium">
              Full Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marcus Bennett"
              className="w-full bg-bg-base border border-border-subtle focus:border-accent-primary rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary transition-colors"
            />
            {errors.name && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle size={11} /> {errors.name}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="block text-text-secondary font-medium">
              Email Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. marcus@student.school.edu"
              className="w-full bg-bg-base border border-border-subtle focus:border-accent-primary rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary transition-colors"
            />
            {errors.email && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle size={11} /> {errors.email}
              </p>
            )}
          </div>

          {/* Student ID */}
          <div className="space-y-1">
            <label className="block text-text-secondary font-medium">
              Student ID <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={id}
              disabled={isEdit}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. STU-1013"
              className="w-full bg-bg-base border border-border-subtle focus:border-accent-primary rounded-lg px-3 py-2 text-text-primary font-mono uppercase placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            />
            {errors.id && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle size={11} /> {errors.id}
              </p>
            )}
          </div>

          {/* Section */}
          <div className="space-y-1">
            <label className="block text-text-secondary font-medium">
              Class Section
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full bg-bg-base border border-border-subtle focus:border-accent-primary rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-colors"
            >
              <option value="Grade 10 - A">Grade 10 - A</option>
              <option value="Grade 10 - B">Grade 10 - B</option>
              <option value="Grade 10 - C">Grade 10 - C</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Subject Grades */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
          <div className="flex items-center gap-2 font-semibold text-text-primary text-xs uppercase tracking-wider">
            <BookOpen size={14} className="text-accent-primary" />
            <span>Academic Performance Scores (0–100)</span>
          </div>
          <span className="text-[11px] text-text-muted font-mono">
            Standard 5-Course Curriculum
          </span>
        </div>

        <div className="space-y-2.5">
          {grades.map((grade, idx) => (
            <div
              key={grade.subject}
              className="p-3 rounded-lg bg-bg-base border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="w-36 font-medium text-text-primary">
                {grade.subject}
              </div>

              {/* Score Input + Letter Badge */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={grade.score}
                    onChange={(e) => handleScoreChange(idx, parseInt(e.target.value, 10))}
                    className="w-16 bg-bg-surface border border-border-subtle focus:border-accent-primary rounded-lg px-2.5 py-1 text-center font-mono font-bold tabular-nums text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                  />
                  <span className="text-text-muted font-mono">%</span>
                </div>

                <span
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center font-mono font-bold text-xs ${
                    grade.letter === 'A'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : grade.letter === 'B'
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                        : grade.letter === 'C'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {grade.letter}
                </span>
              </div>

              {/* Subject Remark */}
              <input
                type="text"
                value={grade.remark || ''}
                onChange={(e) => handleRemarkChange(idx, e.target.value)}
                placeholder="Subject instructor note..."
                className="flex-1 bg-bg-surface border border-border-subtle focus:border-accent-primary rounded-lg px-2.5 py-1 text-text-secondary placeholder:text-text-muted focus:outline-none text-[11px]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Attendance Baseline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
          <div className="flex items-center gap-2 font-semibold text-text-primary text-xs uppercase tracking-wider">
            <CalendarCheck size={14} className="text-accent-primary" />
            <span>Attendance Baseline</span>
          </div>
          <span className="font-mono text-xs tabular-nums text-accent-primary font-bold">
            {attendancePercentage}%
          </span>
        </div>

        <div className="space-y-2 bg-bg-base border border-border-subtle rounded-lg p-3">
          <div className="flex items-center justify-between text-text-secondary">
            <span>Logged Attendance Level</span>
            <span className="font-mono text-text-primary font-medium">
              {attendancePercentage >= 90
                ? 'Good Standing'
                : attendancePercentage >= 75
                  ? 'Warning Threshold'
                  : 'Critical Breach'}
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="100"
            step="1"
            value={attendancePercentage}
            onChange={(e) => setAttendancePercentage(parseInt(e.target.value, 10))}
            className="w-full accent-accent-primary cursor-pointer"
          />
        </div>
      </div>

      {/* Form Buttons */}
      <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-bg-surface hover:bg-bg-surface-raised border border-border-subtle hover:border-border-focus text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Check size={14} />
          <span>{isEdit ? 'Save Changes' : 'Create Student'}</span>
        </button>
      </div>
    </form>
  );
};
