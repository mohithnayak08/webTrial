import React from 'react';
import { Student } from '../../types';
import { GpaCard } from './GpaCard';
import { AttendanceRing } from './AttendanceRing';
import { TrendIndicator } from './TrendIndicator';

export interface StatRowProps {
  student: Student;
}

export const StatRow: React.FC<StatRowProps> = ({ student }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <GpaCard student={student} />
      <AttendanceRing student={student} />
      <TrendIndicator student={student} />
    </div>
  );
};
