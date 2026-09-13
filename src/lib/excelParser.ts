import * as XLSX from 'xlsx';
import { AttendanceRecord, AttendanceStatus, Grade, Student } from '../types';
import { recalculateStudent, scoreToLetter } from './derived';

export interface RowValidationError {
  rowNumber: number;
  studentId?: string;
  field: string;
  value: any;
  message: string;
}

export interface ParsedSpreadsheetResult {
  fileName: string;
  sheetName: string;
  totalRawRows: number;
  detectedHeaders: string[];
  mappedStudents: Student[];
  errors: RowValidationError[];
  sampleRows: Record<string, any>[];
}

// Canonical header keys expected by the system
const HEADER_ALIASES: Record<string, string[]> = {
  student_id: ['student_id', 'studentid', 'student id', 'id', 'roll_no', 'roll number'],
  name: ['name', 'student_name', 'student name', 'full_name', 'full name'],
  email: ['email', 'email_address', 'student_email', 'student email'],
  section: ['section', 'class', 'grade', 'class_section', 'cohort'],
  subject: ['subject', 'course', 'course_name', 'subject_name'],
  score: ['score', 'marks', 'percentage', 'grade_score'],
  attendance_status: ['attendance_status', 'attendance', 'status', 'attendance status'],
  date: ['date', 'attendance_date', 'session_date', 'date_logged'],
};

/**
 * Normalizes an arbitrary header string by removing special characters, underscores, and extra whitespace.
 */
function normalizeHeaderKey(header: string): string {
  const clean = header.trim().toLowerCase().replace(/[\s\-_]+/g, '');
  for (const [canonical, aliases] of Object.entries(HEADER_ALIASES)) {
    for (const alias of aliases) {
      if (alias.replace(/[\s\-_]+/g, '') === clean) {
        return canonical;
      }
    }
  }
  return header.trim();
}

const VALID_ATTENDANCE_STATUSES = new Set(['present', 'absent', 'late', 'excused']);

/**
 * Parses an Excel (.xlsx, .xls) or CSV (.csv) file into validated student entities and error logs.
 */
export async function parseSpreadsheetFile(file: File): Promise<ParsedSpreadsheetResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('The uploaded spreadsheet contains no worksheets.');
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new Error('The uploaded spreadsheet sheet is completely empty.');
  }

  const originalHeaders = Object.keys(rawRows[0] || {});
  const headerMap: Record<string, string> = {};
  for (const h of originalHeaders) {
    headerMap[h] = normalizeHeaderKey(h);
  }

  const errors: RowValidationError[] = [];
  const studentMap = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      section: string;
      gradesMap: Map<string, Grade>;
      attendanceMap: Map<string, AttendanceRecord>;
    }
  >();

  // Process each row in the sheet
  rawRows.forEach((rawRow, idx) => {
    const rowNumber = idx + 2; // Row 1 is header row in Excel

    // Map row to normalized canonical fields
    const row: Record<string, any> = {};
    for (const [origCol, val] of Object.entries(rawRow)) {
      const canonicalKey = headerMap[origCol] || origCol;
      row[canonicalKey] = val;
    }

    const studentId = String(row.student_id || '').trim();
    const name = String(row.name || '').trim();
    const email = String(row.email || '').trim();
    const section = String(row.section || 'Grade 10 - Unassigned').trim();
    const subject = String(row.subject || '').trim();
    const scoreVal = row.score;
    const attendanceVal = String(row.attendance_status || '').trim().toLowerCase();
    const dateVal = String(row.date || '').trim();

    // 1. Mandatory Student Identification validation (§3.5)
    if (!studentId) {
      errors.push({
        rowNumber,
        field: 'student_id',
        value: row.student_id,
        message: 'Missing required Student ID in row.',
      });
      return;
    }

    if (!name) {
      errors.push({
        rowNumber,
        studentId,
        field: 'name',
        value: row.name,
        message: 'Missing required Student Name in row.',
      });
      return;
    }

    // Initialize student entry if new
    if (!studentMap.has(studentId)) {
      studentMap.set(studentId, {
        id: studentId,
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@school.edu`,
        section,
        gradesMap: new Map(),
        attendanceMap: new Map(),
      });
    }

    const studentAccumulator = studentMap.get(studentId)!;

    // 2. Coursework Grade Validation (§3.5: score must be 0-100)
    if (subject) {
      if (scoreVal !== '' && scoreVal !== undefined && scoreVal !== null) {
        const numScore = Number(scoreVal);
        if (isNaN(numScore) || numScore < 0 || numScore > 100) {
          errors.push({
            rowNumber,
            studentId,
            field: 'score',
            value: scoreVal,
            message: `Score for "${subject}" must be a numeric value between 0 and 100 (got ${scoreVal}).`,
          });
        } else {
          studentAccumulator.gradesMap.set(subject, {
            subject,
            score: Math.round(numScore),
            letter: scoreToLetter(numScore),
            remark: 'Imported from spreadsheet coursework record.',
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    // 3. Attendance Session Validation (§3.5: valid enum value)
    if (attendanceVal) {
      if (!VALID_ATTENDANCE_STATUSES.has(attendanceVal)) {
        errors.push({
          rowNumber,
          studentId,
          field: 'attendance_status',
          value: row.attendance_status,
          message: `Attendance status "${attendanceVal}" is invalid. Expected one of: present, absent, late, excused.`,
        });
      } else {
        // Resolve date or fallback to today
        let sessionDate = dateVal;
        if (!sessionDate) {
          sessionDate = new Date().toISOString().split('T')[0];
        } else if (/^\d{5}$/.test(sessionDate)) {
          // Handle Excel serial date numbers
          try {
            const dateObj = XLSX.SSF.parse_date_code(Number(sessionDate));
            const y = dateObj.y;
            const m = String(dateObj.m).padStart(2, '0');
            const d = String(dateObj.d).padStart(2, '0');
            sessionDate = `${y}-${m}-${d}`;
          } catch {
            sessionDate = new Date().toISOString().split('T')[0];
          }
        }

        studentAccumulator.attendanceMap.set(sessionDate, {
          date: sessionDate,
          status: attendanceVal as AttendanceStatus,
        });
      }
    }
  });

  // Convert grouped accumulators into full Student entities
  const mappedStudents: Student[] = [];

  for (const acc of studentMap.values()) {
    const rawStudent: Student = {
      id: acc.id,
      name: acc.name,
      email: acc.email,
      section: acc.section,
      avatarInitials: '',
      grades: Array.from(acc.gradesMap.values()),
      gpa: 0,
      attendance: Array.from(acc.attendanceMap.values()),
      attendancePct: 100,
      feedback: [],
      status: 'good',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Calculate pure derived statistics
    mappedStudents.push(recalculateStudent(rawStudent));
  }

  return {
    fileName: file.name,
    sheetName,
    totalRawRows: rawRows.length,
    detectedHeaders: originalHeaders,
    mappedStudents,
    errors,
    sampleRows: rawRows.slice(0, 5),
  };
}

/**
 * Generates and triggers instant browser download of a sample Excel template (.xlsx).
 */
export function generateSampleExcelTemplate(): void {
  const sampleData = [
    {
      student_id: 'STU-1013',
      name: 'Zara Qureshi',
      email: 'zara.qureshi@student.school.edu',
      section: 'Grade 10 - A',
      subject: 'Mathematics',
      score: 95,
      attendance_status: 'present',
      date: '2026-03-01',
    },
    {
      student_id: 'STU-1013',
      name: 'Zara Qureshi',
      email: 'zara.qureshi@student.school.edu',
      section: 'Grade 10 - A',
      subject: 'Physics',
      score: 92,
      attendance_status: 'present',
      date: '2026-03-02',
    },
    {
      student_id: 'STU-1013',
      name: 'Zara Qureshi',
      email: 'zara.qureshi@student.school.edu',
      section: 'Grade 10 - A',
      subject: 'Chemistry',
      score: 89,
      attendance_status: 'late',
      date: '2026-03-03',
    },
    {
      student_id: 'STU-1014',
      name: 'Devon Vance',
      email: 'devon.vance@student.school.edu',
      section: 'Grade 10 - B',
      subject: 'Computer Science',
      score: 84,
      attendance_status: 'present',
      date: '2026-03-01',
    },
    {
      student_id: 'STU-1014',
      name: 'Devon Vance',
      email: 'devon.vance@student.school.edu',
      section: 'Grade 10 - B',
      subject: 'English',
      score: 78,
      attendance_status: 'absent',
      date: '2026-03-02',
    },
    {
      student_id: 'STU-1015',
      name: 'Kavita Rao',
      email: 'kavita.rao@student.school.edu',
      section: 'Grade 10 - A',
      subject: 'Mathematics',
      score: 68,
      attendance_status: 'excused',
      date: '2026-03-01',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths for readable viewing in Microsoft Excel
  worksheet['!cols'] = [
    { wch: 14 }, // student_id
    { wch: 20 }, // name
    { wch: 32 }, // email
    { wch: 16 }, // section
    { wch: 18 }, // subject
    { wch: 10 }, // score
    { wch: 18 }, // attendance_status
    { wch: 14 }, // date
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

  XLSX.writeFile(workbook, 'students_import_template.xlsx');
}
