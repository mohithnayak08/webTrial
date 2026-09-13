import React, { useMemo, useState } from 'react';
import { useAppState } from '../../lib/useAppState';
import { useTeacherActions } from '../../lib/useTeacherActions';
import { useToast } from '../../context/ToastContext';
import { RosterTable, SortColumn, SortDirection } from './RosterTable';
import { SearchBar } from './SearchBar';
import { FilterChipGroup } from './FilterChipGroup';
import { StudentForm } from './StudentForm';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { ImportExcelModal } from './import/ImportExcelModal';
import { Modal } from '../ui/Modal';
import { calculateOverallGradeBand } from '../../lib/derived';
import { Student } from '../../types';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  SlidersHorizontal,
} from 'lucide-react';

interface StudentRosterPageProps {
  onSelectStudent?: (studentId: string) => void;
}

export const StudentRosterPage: React.FC<StudentRosterPageProps> = ({
  onSelectStudent,
}) => {
  const { state, setUi } = useAppState();
  const teacherActions = useTeacherActions();
  const toast = useToast();

  const [isImportModalOpen, setIsImportModalOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('modal') === 'import';
    }
    return false;
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('modal') === 'add';
    }
    return false;
  });

  const [editingStudent, setEditingStudent] = useState<Student | null>(() => {
    if (typeof window !== 'undefined') {
      const editId = new URLSearchParams(window.location.search).get('editId');
      if (editId) {
        return state.students.find((s) => s.id === editId) || null;
      }
    }
    return null;
  });

  const [deletingStudent, setDeletingStudent] = useState<Student | null>(() => {
    if (typeof window !== 'undefined') {
      const deleteId = new URLSearchParams(window.location.search).get('deleteId');
      if (deleteId) {
        return state.students.find((s) => s.id === deleteId) || null;
      }
    }
    return null;
  });

  const students = state.students;
  const { search, filters, sort } = state.ui;

  // Grade band distribution counts
  const gradeBandCounts = useMemo(() => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    for (const s of students) {
      const band = calculateOverallGradeBand(s.grades);
      counts[band] = (counts[band] || 0) + 1;
    }
    return counts;
  }, [students]);

  // Attendance status distribution counts
  const statusCounts = useMemo(() => {
    const counts = { good: 0, warning: 0, critical: 0 };
    for (const s of students) {
      if (counts[s.status] !== undefined) {
        counts[s.status] += 1;
      }
    }
    return counts;
  }, [students]);

  // Filtered and sorted students list
  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = students.filter((student) => {
      // 1. Text Search Filter (Name or ID, §2.2)
      if (query) {
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesId = student.id.toLowerCase().includes(query);
        if (!matchesName && !matchesId) return false;
      }

      // 2. Attendance Status Filter (§2.2)
      if (filters.attendanceStatus) {
        if (student.status !== filters.attendanceStatus) return false;
      }

      // 3. Grade Band Filter (A/B/C/D/F, §2.2)
      if (filters.gradeBand) {
        const overallBand = calculateOverallGradeBand(student.grades);
        const hasSubjectInBand = student.grades.some(
          (g) => g.letter === filters.gradeBand,
        );
        if (overallBand !== filters.gradeBand && !hasSubjectInBand) {
          return false;
        }
      }

      return true;
    });

    // Client-side Sort (§2.2 & §3.3)
    const sortCol = (sort.column as SortColumn) || 'name';
    const sortDir = sort.direction || 'asc';

    result.sort((a, b) => {
      let valA: any = a[sortCol];
      let valB: any = b[sortCol];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB as string).toLowerCase();
        return sortDir === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      if (typeof valA === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }

      return 0;
    });

    return result;
  }, [students, search, filters, sort]);

  // Search updater
  const handleSearchChange = (val: string) => {
    setUi({ search: val });
  };

  // Grade Band filter updater
  const handleGradeBandChange = (band: string | null) => {
    setUi((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        gradeBand: band,
      },
    }));
  };

  // Attendance Status filter updater
  const handleAttendanceStatusChange = (status: any) => {
    setUi((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        attendanceStatus: status,
      },
    }));
  };

  // Sort updater
  const handleSortChange = (column: SortColumn) => {
    setUi((prev) => {
      const isCurrent = prev.sort.column === column;
      const nextDir: SortDirection =
        isCurrent && prev.sort.direction === 'asc' ? 'desc' : 'asc';
      return {
        ...prev,
        sort: {
          column,
          direction: nextDir,
        },
      };
    });
  };

  // Reset all filters & search
  const handleResetFilters = () => {
    setUi({
      search: '',
      filters: {
        gradeBand: null,
        attendanceStatus: null,
      },
    });
  };

  const hasActiveFilters = Boolean(
    search.trim() || filters.gradeBand || filters.attendanceStatus,
  );

  const handleView = (studentId: string) => {
    const s = students.find((item) => item.id === studentId);
    if (s && onSelectStudent) {
      onSelectStudent(studentId);
    } else {
      toast.info(`Viewing profile for ${s?.name || studentId}`);
    }
  };

  const handleEdit = (studentId: string) => {
    const s = students.find((item) => item.id === studentId);
    if (s) {
      setEditingStudent(s);
    }
  };

  const handleDeleteClick = (studentId: string) => {
    const s = students.find((item) => item.id === studentId);
    if (s) {
      setDeletingStudent(s);
    }
  };

  // Add Student Handler
  const handleAddSubmit = (newStudent: Student) => {
    const success = teacherActions.addStudent(newStudent);
    if (success) {
      setIsAddModalOpen(false);
      toast.success(`Successfully added student "${newStudent.name}" (${newStudent.id}) to roster.`);
    }
  };

  // Edit Student Handler
  const handleEditSubmit = (updatedStudent: Student) => {
    const success = teacherActions.updateStudent(updatedStudent.id, updatedStudent);
    if (success) {
      setEditingStudent(null);
      toast.success(`Saved updates for "${updatedStudent.name}" (${updatedStudent.id}).`);
    }
  };

  // Delete Student Handler (§2.2 & §5 Step 8)
  const handleConfirmDelete = (studentId: string) => {
    const studentName = deletingStudent?.name || studentId;
    const success = teacherActions.deleteStudent(studentId);
    if (success) {
      setDeletingStudent(null);
      toast.error(`Student "${studentName}" (${studentId}) was permanently removed from roster.`);
    }
  };

  // Import Excel Spreadsheet Handler (§2.2 & §5 Step 10)
  const handleImportSubmit = (incomingStudents: Student[]) => {
    const success = teacherActions.importSpreadsheetStudents(incomingStudents);
    if (success) {
      toast.success(
        `Successfully imported and merged ${incomingStudents.length} student record${
          incomingStudents.length === 1 ? '' : 's'
        } from Excel spreadsheet.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-accent-primary font-mono font-medium">
              Teacher Console
            </span>
            <span className="text-text-muted text-xs">•</span>
            <span className="text-xs text-text-muted">Directory Management</span>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight flex items-center gap-3">
            <Users size={24} className="text-accent-primary" />
            <span>Student Roster</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Search, filter by grade band or attendance health, and inspect all student records.
          </p>
        </div>

        {/* Action Buttons: Add Student & Import Excel (§2.2 & §5 Step 10) */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-bg-surface hover:bg-bg-surface-raised border border-border-subtle hover:border-border-focus text-xs font-medium text-text-primary flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet size={14} className="text-accent-primary" />
            <span>Import Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <UserPlus size={14} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar Controls (§2.2) */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 space-y-4">
        {/* Row 1: Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Filter by name or student ID (e.g. Aisha, STU-1001)..."
            className="flex-1"
          />

          {/* Matches Counter Chip */}
          <div className="px-3 py-2 rounded-lg bg-bg-base border border-border-subtle text-xs text-text-secondary flex items-center justify-between sm:justify-start gap-2 whitespace-nowrap">
            <SlidersHorizontal size={13} className="text-accent-primary" />
            <span>
              Matching Records:{' '}
              <strong className="text-text-primary font-mono tabular-nums">
                {filteredStudents.length}
              </strong>{' '}
              / {students.length}
            </span>
          </div>
        </div>

        {/* Row 2: Status & Grade Band Filter Chips */}
        <FilterChipGroup
          selectedGradeBand={filters.gradeBand}
          onSelectGradeBand={handleGradeBandChange}
          selectedAttendanceStatus={filters.attendanceStatus}
          onSelectAttendanceStatus={handleAttendanceStatusChange}
          statusCounts={statusCounts}
          gradeBandCounts={gradeBandCounts}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Filtered Student Roster Table */}
      <RosterTable
        students={filteredStudents}
        sortColumn={(sort.column as SortColumn) || 'name'}
        sortDirection={sort.direction || 'asc'}
        onSortChange={handleSortChange}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onResetFilters={handleResetFilters}
        totalUnfilteredCount={students.length}
      />

      {/* Add Student Modal (§2.2 & §5 Step 7) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Student Record"
        description="Register a new student entity into the institutional directory. Scores and attendance automatically calculate GPA and academic health status."
        size="lg"
      >
        <StudentForm
          existingStudents={students}
          onSubmit={handleAddSubmit}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Student Modal (§2.2 & §5 Step 7) */}
      <Modal
        isOpen={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
        title={`Edit Student: ${editingStudent?.name || ''}`}
        description={`Updating academic profile and coursework grades for ${editingStudent?.id || ''}. Changes apply optimistically and synchronize immediately.`}
        size="lg"
      >
        {editingStudent && (
          <StudentForm
            initialData={editingStudent}
            existingStudents={students}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingStudent(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal (§2.2 & §5 Step 8) */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingStudent)}
        student={deletingStudent}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingStudent(null)}
      />

      {/* Import Excel Modal (§2.2 & §5 Step 10) */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportStudents={handleImportSubmit}
      />
    </div>
  );
};
