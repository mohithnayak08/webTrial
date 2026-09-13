import {
  AttendanceRecord,
  Grade,
  LetterGrade,
  Student,
  StudentStatus,
} from '../types';

/**
 * Maps a numeric score (0–100) to a letter grade (§1.2 & §3.1)
 */
export function scoreToLetter(score: number): LetterGrade {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Derives overall letter grade band for a student based on average score (§2.2)
 */
export function calculateOverallGradeBand(grades: Grade[]): LetterGrade {
  if (!grades || grades.length === 0) return 'F';
  const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
  return scoreToLetter(Math.round(totalScore / grades.length));
}

/**
 * Maps a numeric score (0–100) to a 4.0 scale GPA point value (§3.6)
 * A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0.0
 */
export function scoreToGpaPoint(score: number): number {
  if (score >= 90) return 4.0;
  if (score >= 80) return 3.0;
  if (score >= 70) return 2.0;
  if (score >= 60) return 1.0;
  return 0.0;
}

/**
 * Computes overall GPA across all subjects on a 4.0 scale (§3.6)
 * Returns a number rounded to 2 decimal places.
 */
export function calculateGpa(grades: Grade[]): number {
  if (!grades || grades.length === 0) return 0.0;
  const totalPoints = grades.reduce(
    (sum, grade) => sum + scoreToGpaPoint(grade.score),
    0,
  );
  return Number((totalPoints / grades.length).toFixed(2));
}

/**
 * Computes attendance percentage (§3.6)
 * Rule: present = 1.0, late = 0.5, absent = 0.
 * 'excused' days are excluded from the denominator.
 * Returns a number rounded to 1 decimal place (0–100).
 */
export function calculateAttendancePct(records: AttendanceRecord[]): number {
  if (!records || records.length === 0) return 100.0;

  let presentEquivalent = 0;
  let totalEvaluatedDays = 0;

  for (const record of records) {
    if (record.status === 'excused') {
      // Excused days are strictly excluded from the denominator (§3.6)
      continue;
    }
    totalEvaluatedDays += 1;
    if (record.status === 'present') {
      presentEquivalent += 1.0;
    } else if (record.status === 'late') {
      presentEquivalent += 0.5;
    }
    // absent adds 0
  }

  if (totalEvaluatedDays === 0) return 100.0;
  return Number(((presentEquivalent / totalEvaluatedDays) * 100).toFixed(1));
}

/**
 * Derives overall student status (§3.6):
 * - 'good': attendancePct >= 90 AND gpa >= 3.0
 * - 'critical': attendancePct < 75 OR gpa < 2.0
 * - 'warning': everything else
 */
export function deriveStatus(
  gpa: number,
  attendancePct: number,
): StudentStatus {
  if (attendancePct >= 90.0 && gpa >= 3.0) {
    return 'good';
  }
  if (attendancePct < 75.0 || gpa < 2.0) {
    return 'critical';
  }
  return 'warning';
}

/**
 * Derives 2-letter initials from student full name (§3.1)
 * e.g. "Aisha Khan" -> "AK", "Rohan Mehta" -> "RM"
 */
export function deriveAvatarInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Recomputes all derived fields for a student object to guarantee consistency.
 * Never allows stale GPA, attendancePct, status, or avatar initials.
 */
export function recalculateStudent(student: Student): Student {
  const gpa = calculateGpa(student.grades);
  const attendancePct = calculateAttendancePct(student.attendance);
  const status = deriveStatus(gpa, attendancePct);
  const avatarInitials = deriveAvatarInitials(student.name);

  return {
    ...student,
    avatarInitials,
    gpa,
    attendancePct,
    status,
    updatedAt: new Date().toISOString(),
  };
}
