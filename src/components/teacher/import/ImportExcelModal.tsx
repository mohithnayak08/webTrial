import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { FileDropZone } from './FileDropZone';
import { ColumnMappingPreview } from './ColumnMappingPreview';
import { ImportSummary } from './ImportSummary';
import { parseSpreadsheetFile, ParsedSpreadsheetResult } from '../../../lib/excelParser';
import { recalculateStudent } from '../../../lib/derived';
import { Student } from '../../../types';
import {
  ArrowRight,
  Check,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

export interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportStudents: (incomingStudents: Student[]) => void;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  onImportStudents,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParsedSpreadsheetResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<'upload' | 'preview'>('upload');

  React.useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('importSample') === 'true') {
      const sampleStudents: Student[] = [
        recalculateStudent({
          id: 'STU-1013',
          name: 'Zara Qureshi',
          email: 'zara.qureshi@student.school.edu',
          section: 'Grade 10 - A',
          avatarInitials: 'ZQ',
          grades: [
            { subject: 'Mathematics', score: 95, letter: 'A', remark: 'Imported from spreadsheet coursework record.', updatedAt: new Date().toISOString() },
            { subject: 'Physics', score: 92, letter: 'A', remark: 'Imported from spreadsheet coursework record.', updatedAt: new Date().toISOString() },
            { subject: 'Chemistry', score: 89, letter: 'B', remark: 'Imported from spreadsheet coursework record.', updatedAt: new Date().toISOString() },
          ],
          gpa: 3.67,
          attendance: [
            { date: '2026-03-01', status: 'present' },
            { date: '2026-03-02', status: 'present' },
            { date: '2026-03-03', status: 'late' },
          ],
          attendancePct: 83.3,
          feedback: [],
          status: 'warning',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        recalculateStudent({
          id: 'STU-1014',
          name: 'Devon Vance',
          email: 'devon.vance@student.school.edu',
          section: 'Grade 10 - B',
          avatarInitials: 'DV',
          grades: [
            { subject: 'Computer Science', score: 84, letter: 'B', remark: 'Imported from spreadsheet coursework record.', updatedAt: new Date().toISOString() },
            { subject: 'English', score: 78, letter: 'C', remark: 'Imported from spreadsheet coursework record.', updatedAt: new Date().toISOString() },
          ],
          gpa: 2.5,
          attendance: [
            { date: '2026-03-01', status: 'present' },
            { date: '2026-03-02', status: 'absent' },
          ],
          attendancePct: 50.0,
          feedback: [],
          status: 'critical',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      ];

      setParseResult({
        fileName: 'students_import_template.xlsx',
        sheetName: 'Students',
        totalRawRows: 6,
        detectedHeaders: ['student_id', 'name', 'email', 'section', 'subject', 'score', 'attendance_status', 'date'],
        mappedStudents: sampleStudents,
        errors: [
          {
            rowNumber: 7,
            studentId: 'STU-1016',
            field: 'score',
            value: '105',
            message: 'Score for "History" must be a numeric value between 0 and 100 (got 105).',
          },
        ],
        sampleRows: [
          { student_id: 'STU-1013', name: 'Zara Qureshi', email: 'zara.q@school.edu', section: 'Grade 10 - A', subject: 'Mathematics', score: 95, attendance_status: 'present', date: '2026-03-01' },
          { student_id: 'STU-1013', name: 'Zara Qureshi', email: 'zara.q@school.edu', section: 'Grade 10 - A', subject: 'Physics', score: 92, attendance_status: 'present', date: '2026-03-02' },
          { student_id: 'STU-1014', name: 'Devon Vance', email: 'devon.v@school.edu', section: 'Grade 10 - B', subject: 'Computer Science', score: 84, attendance_status: 'present', date: '2026-03-01' },
        ],
      });
      setActiveStep('preview');
    }
  }, []);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsParsing(true);
    setParseError(null);

    try {
      const result = await parseSpreadsheetFile(file);
      setParseResult(result);
      setActiveStep('preview');
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse the selected spreadsheet file.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParseResult(null);
    setParseError(null);
    setActiveStep('upload');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleCommitImport = () => {
    if (!parseResult || parseResult.mappedStudents.length === 0) return;
    onImportStudents(parseResult.mappedStudents);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Student Directory from Excel Spreadsheet"
      description="Upload Microsoft Excel (.xlsx, .xls) or CSV files to batch-register students, coursework grades, and attendance logs."
      size="xl"
    >
      <div className="space-y-6">
        {/* Step Indicator Bar */}
        <div className="flex items-center gap-3 text-xs font-mono border-b border-border-subtle pb-4">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${
              activeStep === 'upload'
                ? 'bg-accent-primary/10 text-accent-primary font-semibold border border-accent-primary/30'
                : 'text-text-muted'
            }`}
          >
            <span>1. Upload Spreadsheet</span>
          </div>
          <ArrowRight size={12} className="text-text-muted" />
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${
              activeStep === 'preview'
                ? 'bg-accent-primary/10 text-accent-primary font-semibold border border-accent-primary/30'
                : 'text-text-muted'
            }`}
          >
            <span>2. Validation &amp; Mapping Preview</span>
          </div>
        </div>

        {/* Error Notification */}
        {parseError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Spreadsheet Parsing Failed:</span>{' '}
              {parseError}
            </div>
          </div>
        )}

        {/* Step 1: Upload File */}
        {activeStep === 'upload' && (
          <FileDropZone
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            isLoading={isParsing}
          />
        )}

        {/* Step 2: Preview & Validation */}
        {activeStep === 'preview' && parseResult && (
          <div className="space-y-6">
            <ColumnMappingPreview parseResult={parseResult} />
            <ImportSummary parseResult={parseResult} />
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {activeStep === 'preview' ? (
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 rounded-lg bg-bg-surface-raised hover:bg-bg-base border border-border-subtle text-xs text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <RotateCcw size={13} />
              <span>Choose Another File</span>
            </button>
          ) : (
            <span className="text-xs text-text-muted">
              Supported extensions: <code className="text-text-secondary">.xlsx</code>,{' '}
              <code className="text-text-secondary">.xls</code>,{' '}
              <code className="text-text-secondary">.csv</code>
            </span>
          )}

          <div className="flex items-center gap-2.5 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg bg-bg-surface hover:bg-bg-surface-raised border border-border-subtle text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>

            {activeStep === 'preview' && parseResult && (
              <button
                type="button"
                disabled={parseResult.mappedStudents.length === 0}
                onClick={handleCommitImport}
                className="px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Check size={14} />
                <span>
                  Commit &amp; Upsert {parseResult.mappedStudents.length} Student
                  {parseResult.mappedStudents.length === 1 ? '' : 's'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
