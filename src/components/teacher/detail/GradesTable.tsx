import React, { useState } from 'react';
import { Grade } from '../../../types';
import { scoreToLetter } from '../../../lib/derived';
import {
  BookOpen,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Pencil,
} from 'lucide-react';

export interface GradesTableProps {
  grades: Grade[];
  onSaveGrades: (updatedGrades: Grade[]) => void;
  editable?: boolean;
}

export const GradesTable: React.FC<GradesTableProps> = ({
  grades,
  onSaveGrades,
  editable = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localGrades, setLocalGrades] = useState<Grade[]>(grades);
  const [newSubject, setNewSubject] = useState('');
  const [newScore, setNewScore] = useState(85);
  const [isAddingSubject, setIsAddingSubject] = useState(false);

  // Sync with prop when grades prop updates
  React.useEffect(() => {
    setLocalGrades(grades);
  }, [grades]);

  const handleScoreChange = (index: number, score: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(score) ? 0 : score));
    setLocalGrades((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        score: clamped,
        letter: scoreToLetter(clamped),
        updatedAt: new Date().toISOString(),
      };
      return next;
    });
  };

  const handleRemarkChange = (index: number, remark: string) => {
    setLocalGrades((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        remark,
        updatedAt: new Date().toISOString(),
      };
      return next;
    });
  };

  const handleDeleteSubject = (index: number) => {
    setLocalGrades((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    const clampedScore = Math.max(0, Math.min(100, newScore));
    const newGradeItem: Grade = {
      subject: newSubject.trim(),
      score: clampedScore,
      letter: scoreToLetter(clampedScore),
      remark: 'New course assessment',
      updatedAt: new Date().toISOString(),
    };
    setLocalGrades((prev) => [...prev, newGradeItem]);
    setNewSubject('');
    setNewScore(85);
    setIsAddingSubject(false);
  };

  const handleSave = () => {
    onSaveGrades(localGrades);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalGrades(grades);
    setIsEditing(false);
    setIsAddingSubject(false);
  };

  const getLetterBadgeStyle = (letter: string) => {
    switch (letter) {
      case 'A':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'B':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'C':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary tracking-tight flex items-center gap-2">
            <BookOpen size={18} className="text-accent-primary" />
            <span>Curriculum Coursework &amp; Subject Grades</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Subject-level performance, letter evaluations, and teacher remarks.
          </p>
        </div>

        {editable && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1.5 rounded-lg bg-bg-surface-raised border border-border-subtle text-xs text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-3.5 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Check size={14} />
                  <span>Save Coursework</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-lg bg-bg-surface-raised hover:bg-bg-base border border-border-subtle hover:border-border-focus text-xs font-medium text-text-primary flex items-center gap-1.5 transition-colors"
              >
                <Pencil size={13} className="text-accent-primary" />
                <span>Edit Grades Inline</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-base/40 text-text-secondary uppercase text-[11px] tracking-wider select-none">
              <th className="py-3 px-6 font-medium">Subject</th>
              <th className="py-3 px-4 font-medium text-center">Score</th>
              <th className="py-3 px-4 font-medium text-center">Letter</th>
              <th className="py-3 px-6 font-medium">Teacher Remark</th>
              {isEditing && (
                <th className="py-3 px-4 font-medium text-right text-text-muted">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {localGrades.map((grade, idx) => (
              <tr key={`${grade.subject}-${idx}`} className="hover:bg-bg-surface-raised/50 transition-colors">
                {/* Subject Name */}
                <td className="py-3.5 px-6 font-medium text-text-primary">
                  {grade.subject}
                </td>

                {/* Score */}
                <td className="py-3.5 px-4 text-center">
                  {isEditing ? (
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={grade.score}
                        onChange={(e) =>
                          handleScoreChange(idx, parseInt(e.target.value, 10))
                        }
                        className="w-16 bg-bg-base border border-border-subtle focus:border-accent-primary rounded-lg px-2 py-1 text-center font-mono font-bold tabular-nums text-text-primary text-xs focus:outline-none focus:ring-1 focus:ring-accent-primary"
                      />
                      <span className="text-text-muted font-mono">%</span>
                    </div>
                  ) : (
                    <span className="font-mono tabular-nums font-semibold text-text-primary text-xs">
                      {grade.score}%
                    </span>
                  )}
                </td>

                {/* Letter Grade Badge */}
                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono font-bold text-xs border ${getLetterBadgeStyle(
                      grade.letter,
                    )}`}
                  >
                    {grade.letter}
                  </span>
                </td>

                {/* Remark */}
                <td className="py-3.5 px-6 text-text-secondary">
                  {isEditing ? (
                    <input
                      type="text"
                      value={grade.remark || ''}
                      onChange={(e) => handleRemarkChange(idx, e.target.value)}
                      placeholder="Add teacher note for this subject..."
                      className="w-full bg-bg-base border border-border-subtle focus:border-accent-primary rounded-lg px-3 py-1 text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
                    />
                  ) : (
                    <span className="italic text-text-muted">
                      {grade.remark ? `"${grade.remark}"` : '—'}
                    </span>
                  )}
                </td>

                {/* Row Delete when Editing */}
                {isEditing && (
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteSubject(idx)}
                      title={`Remove ${grade.subject}`}
                      className="p-1 rounded text-text-muted hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Subject Drawer when in Editing Mode */}
      {isEditing && (
        <div className="p-4 bg-bg-base/60 border-t border-border-subtle">
          {isAddingSubject ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="New subject name (e.g. World History)..."
                className="flex-1 bg-bg-surface border border-border-subtle focus:border-accent-primary rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newScore}
                  onChange={(e) => setNewScore(parseInt(e.target.value, 10))}
                  className="w-20 bg-bg-surface border border-border-subtle focus:border-accent-primary rounded-lg px-2.5 py-1.5 text-xs text-center font-mono font-bold text-text-primary focus:outline-none"
                />
                <span className="text-text-muted text-xs font-mono">%</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="px-3 py-1.5 rounded-lg bg-accent-primary text-white text-xs font-medium"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingSubject(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-bg-surface text-text-secondary text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingSubject(true)}
              className="px-3 py-1.5 rounded-lg bg-bg-surface hover:bg-bg-surface-raised border border-border-subtle text-xs text-text-primary flex items-center gap-1.5 transition-colors"
            >
              <Plus size={13} className="text-accent-primary" />
              <span>Add Subject Evaluation</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
