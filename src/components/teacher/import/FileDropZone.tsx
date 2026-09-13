import React, { useRef, useState } from 'react';
import { generateSampleExcelTemplate } from '../../../lib/excelParser';
import {
  FileSpreadsheet,
  UploadCloud,
  FileDown,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export interface FileDropZoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  selectedFile,
  onFileSelect,
  isLoading = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSelectFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSelectFile(file);
    }
  };

  const validateAndSelectFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      onFileSelect(file);
    } else {
      alert('Please upload a valid Microsoft Excel (.xlsx, .xls) or CSV (.csv) file.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Main Drag-and-Drop Dropzone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-3 ${
          isDragOver
            ? 'border-accent-primary bg-accent-primary/10'
            : selectedFile
            ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60'
            : 'border-border-subtle bg-bg-base/60 hover:bg-bg-surface-raised hover:border-border-focus'
        }`}
      >
        {selectedFile ? (
          <>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-semibold text-text-primary">
                  {selectedFile.name}
                </span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
              <p className="text-xs text-text-secondary mt-1 font-mono">
                {formatFileSize(selectedFile.size)} • Click or drop another file to replace
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-bg-surface border border-border-subtle flex items-center justify-center text-accent-primary">
              <UploadCloud size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text-primary">
                Drag and drop your Excel spreadsheet here
              </p>
              <p className="text-xs text-text-secondary">
                Supports Microsoft Excel (<strong className="text-text-primary">.xlsx</strong>,{' '}
                <strong className="text-text-primary">.xls</strong>) and standard{' '}
                <strong className="text-text-primary">.csv</strong> files.
              </p>
            </div>
            <button
              type="button"
              className="mt-2 px-3.5 py-1.5 rounded-lg bg-bg-surface-raised border border-border-subtle text-xs font-medium text-text-primary hover:border-border-focus transition-colors"
            >
              Browse Local Files
            </button>
          </>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-bg-surface/80 backdrop-blur-xs rounded-xl flex items-center justify-center">
            <div className="text-xs text-text-primary flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
              <span>Analyzing spreadsheet worksheets...</span>
            </div>
          </div>
        )}
      </div>

      {/* Helper Bar: Sample Template Download & Formatting Specs */}
      <div className="p-3.5 rounded-xl bg-bg-base border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-text-secondary">
          <FileText size={14} className="text-accent-primary shrink-0" />
          <span>Need the expected column format and sample rows?</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            generateSampleExcelTemplate();
          }}
          className="px-3 py-1.5 rounded-lg bg-bg-surface hover:bg-bg-surface-raised border border-border-subtle hover:border-border-focus text-text-primary flex items-center gap-1.5 transition-colors self-start sm:self-auto font-medium"
        >
          <FileDown size={14} className="text-emerald-400" />
          <span>Download Sample Excel Template (.xlsx)</span>
        </button>
      </div>
    </div>
  );
};
