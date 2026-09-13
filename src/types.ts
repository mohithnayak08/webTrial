export type LetterGrade = "A" | "B" | "C" | "D" | "F";

export type Grade = {
  subject: string;          // e.g. "Mathematics"
  score: number;            // 0–100
  letter: LetterGrade;
  remark?: string;          // teacher note specific to this subject
  updatedAt: string;        // ISO 8601
};

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type AttendanceRecord = {
  date: string;             // ISO 8601 date, "YYYY-MM-DD"
  status: AttendanceStatus;
};

export type FeedbackEntry = {
  id: string;
  date: string;             // ISO 8601
  teacherId: string;
  teacherName: string;
  message: string;
};

export type StudentStatus = "good" | "warning" | "critical";

export type Student = {
  id: string;                 // e.g. "STU-1001"
  name: string;
  email: string;
  section: string;            // e.g. "Grade 10 - B"
  avatarInitials: string;     // derived, e.g. "AK"
  grades: Grade[];
  gpa: number;                // computed: 0.0–4.0 scale
  attendance: AttendanceRecord[];
  attendancePct: number;      // computed: present / total * 100
  feedback: FeedbackEntry[];
  status: StudentStatus;      // derived from attendancePct + gpa thresholds
  createdAt: string;
  updatedAt: string;
};

export type Teacher = {
  id: string;         // e.g. "TCH-01"
  name: string;
  email: string;
};

export type UserRole = "teacher" | "student";

export type AppUiState = {
  search: string;
  filters: {
    gradeBand: string | null;
    attendanceStatus: StudentStatus | null;
  };
  sort: {
    column: string;
    direction: "asc" | "desc";
  };
};

export type AppState = {
  currentRole: UserRole;
  currentStudentId: string | null;   // set when currentRole === "student"
  teacher: Teacher;
  students: Student[];
  ui: AppUiState;
};
