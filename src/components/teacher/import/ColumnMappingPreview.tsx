import React from 'react';
import { ParsedSpreadsheetResult } from '../../../lib/excelParser';
import { Check, Layers } from 'lucide-react';

export interface ColumnMappingPreviewProps {
  parseResult: ParsedSpreadsheetResult;
}

export const ColumnMappingPreview: React.FC<ColumnMappingPreviewProps> = ({
  parseResult,
}) => {
  const { sheetName, totalRawRows, detectedHeaders, sampleRows } = parseResult;

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden space-y-4">
      {/* Top Meta Bar */}
      <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-base/40">
        <div className="flex items-center gap-2 text-xs">
          <Layers size={14} className="text-accent-primary" />
          <span className="text-text-secondary">Active Worksheet:</span>
          <span className="font-mono font-semibold text-text-primary px-2 py-0.5 rounded bg-bg-surface border border-border-subtle">
            {sheetName}
          </span>
        </div>

        <div className="text-xs text-text-secondary flex items-center gap-2">
          <span>Total Rows Detected:</span>
          <strong className="text-text-primary font-mono tabular-nums">
            {totalRawRows}
          </strong>
        </div>
      </div>

      {/* Detected Headers Chips */}
      <div className="px-4 space-y-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
          Detected &amp; Normalized Column Headers
        </span>
        <div className="flex flex-wrap gap-1.5">
          {detectedHeaders.map((header) => (
            <span
              key={header}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-bg-base border border-border-subtle text-text-primary"
            >
              <Check size={11} className="text-emerald-400" />
              <span>{header}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Sample Rows Table Preview */}
      <div className="overflow-x-auto border-t border-border-subtle">
        <div className="px-4 py-2 bg-bg-base/50 text-[11px] text-text-secondary flex items-center justify-between">
          <span>Sample Spreadsheet Rows (First {sampleRows.length} Rows)</span>
          <span className="font-mono text-text-muted">Preview Only</span>
        </div>

        <table className="w-full text-left text-xs border-collapse font-mono">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-base/80 text-text-secondary text-[11px]">
              {detectedHeaders.map((header) => (
                <th key={header} className="py-2.5 px-4 font-semibold whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {sampleRows.map((row, rowIdx) => (
              <tr
                key={`preview-row-${rowIdx}`}
                className="hover:bg-bg-surface-raised/40 transition-colors"
              >
                {detectedHeaders.map((header) => (
                  <td
                    key={`${rowIdx}-${header}`}
                    className="py-2.5 px-4 text-text-primary whitespace-nowrap tabular-nums text-xs"
                  >
                    {row[header] !== undefined && row[header] !== null
                      ? String(row[header])
                      : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
