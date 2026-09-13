import React, { useState } from 'react';
import { useAppState } from '../../lib/useAppState';
import { useTeacherActions } from '../../lib/useTeacherActions';
import { useToast } from '../../context/ToastContext';
import { ProfileHeader } from './detail/ProfileHeader';
import { GradesTable } from './detail/GradesTable';
import { AttendanceLog } from './detail/AttendanceLog';
import { FeedbackTimeline } from './detail/FeedbackTimeline';
import { Modal } from '../ui/Modal';
import { StudentForm } from './StudentForm';
import { Grade, AttendanceRecord, FeedbackEntry, Student } from '../../types';
import {
  AlertCircle,
  BookOpen,
  CalendarCheck,
  Layers,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';

export interface StudentDetailPageProps {
  studentId: string;
  onBack: () => void;
}

export type DetailTab = 'all' | 'grades' | 'attendance' | 'feedback';

export const StudentDetailPage: React.FC<StudentDetailPageProps> = ({
  studentId,
  onBack,
}) => {
  const { state } = useAppState();
  const teacherActions = useTeacherActions();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<DetailTab>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Retrieve student from live state
  const student = state.students.find((s) => s.id === studentId);

  if (!student) {
    return (
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-12 text-center space-y-4 max-w-lg mx-auto mt-8">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Student Record Not Found
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Could not find an active student entity with ID{' '}
            <code className="text-accent-primary font-mono">{studentId}</code> in
            the directory.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-medium inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Return to Student Roster</span>
        </button>
      </div>
    );
  }

  // 1. Save Coursework Grades
  const handleSaveGrades = (updatedGrades: Grade[]) => {
    const success = teacherActions.updateStudent(student.id, {
      grades: updatedGrades,
    });
    if (success) {
      toast.success(
        `Coursework grades saved for ${student.name}. GPA and standing recalculated.`,
      );
    }
  };

  // 2. Save Attendance Records
  const handleSaveAttendance = (updatedAttendance: AttendanceRecord[]) => {
    const success = teacherActions.updateStudent(student.id, {
      attendance: updatedAttendance,
    });
    if (success) {
      toast.success(
        `Attendance log saved for ${student.name}. Rate updated to ${student.attendancePct.toFixed(1)}%.`,
      );
    }
  };

  // 3. Save Teacher Feedback
  const handleSaveFeedback = (updatedFeedback: FeedbackEntry[]) => {
    const success = teacherActions.updateStudent(student.id, {
      feedback: updatedFeedback,
    });
    if (success) {
      toast.success(`Teacher feedback timeline updated for ${student.name}.`);
    }
  };

  // 4. Update General Profile Information
  const handleSaveProfile = (updatedStudent: Student) => {
    const success = teacherActions.updateStudent(student.id, updatedStudent);
    if (success) {
      setIsEditModalOpen(false);
      toast.success(`Student profile information updated for ${updatedStudent.name}.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Identity & Telemetry */}
      <ProfileHeader
        student={student}
        onBack={onBack}
        onEditProfile={() => setIsEditModalOpen(true)}
      />

      {/* 2. Sub-Navigation Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-bg-surface border border-border-subtle overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'all'
              ? 'bg-bg-surface-raised text-text-primary border border-border-focus/50 shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Layers size={13} className={activeTab === 'all' ? 'text-accent-primary' : 'text-text-muted'} />
          <span>Full Telemetry View</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('grades')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'grades'
              ? 'bg-bg-surface-raised text-text-primary border border-border-focus/50 shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <BookOpen size={13} className={activeTab === 'grades' ? 'text-accent-primary' : 'text-text-muted'} />
          <span>Curriculum Grades ({student.grades.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'attendance'
              ? 'bg-bg-surface-raised text-text-primary border border-border-focus/50 shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <CalendarCheck size={13} className={activeTab === 'attendance' ? 'text-emerald-400' : 'text-text-muted'} />
          <span>Attendance Sessions ({student.attendance.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('feedback')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'feedback'
              ? 'bg-bg-surface-raised text-text-primary border border-border-focus/50 shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <MessageSquare size={13} className={activeTab === 'feedback' ? 'text-accent-primary' : 'text-text-muted'} />
          <span>Teacher Remarks ({student.feedback.length})</span>
        </button>
      </div>

      {/* 3. Section Content based on selected Tab */}
      <div className="space-y-6">
        {(activeTab === 'all' || activeTab === 'grades') && (
          <GradesTable
            grades={student.grades}
            onSaveGrades={handleSaveGrades}
            editable={true}
          />
        )}

        {(activeTab === 'all' || activeTab === 'attendance') && (
          <AttendanceLog
            attendance={student.attendance}
            onSaveAttendance={handleSaveAttendance}
            editable={true}
          />
        )}

        {(activeTab === 'all' || activeTab === 'feedback') && (
          <FeedbackTimeline
            feedback={student.feedback}
            onSaveFeedback={handleSaveFeedback}
            editable={true}
          />
        )}
      </div>

      {/* 4. Edit Student Information Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Student Profile: ${student.name}`}
        description={`Updating general institutional demographics and registration details for ${student.id}.`}
        size="lg"
      >
        <StudentForm
          initialData={student}
          existingStudents={state.students}
          onSubmit={handleSaveProfile}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
