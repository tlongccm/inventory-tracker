/**
 * ImportModal component - CSV file upload with preview/confirm workflow.
 *
 * Two-phase import:
 * 1. Upload CSV -> Preview with validation
 * 2. Review, fix errors, select rows -> Confirm import
 */

import { useState, useRef } from 'react';
import type { ImportResult, ImportPreviewResult, ImportPreviewRow } from '../types/equipment';
import { previewImport, confirmImport } from '../services/api';
import ImportPreview from './ImportPreview';

interface ImportModalProps {
  onImport?: (file: File) => Promise<ImportResult>;  // Legacy - now uses preview workflow
  onClose: () => void;
}

type Phase = 'upload' | 'preview' | 'importing' | 'result';

export default function ImportModal({ onClose }: ImportModalProps) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store updated rows (for edited problematic rows that become validated)
  const [updatedRows, setUpdatedRows] = useState<Map<number, ImportPreviewRow>>(new Map());

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const previewResult = await previewImport(file);
      setPreview(previewResult);

      // Auto-select all validated rows
      const validatedRowNumbers = new Set(previewResult.validated_rows.map((r) => r.row_number));
      setSelectedRows(validatedRowNumbers);

      setPhase('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleRowUpdate = (rowNumber: number, updatedRow: ImportPreviewRow) => {
    // When a row is updated (edited and re-validated)
    setUpdatedRows((prev) => {
      const next = new Map(prev);
      next.set(rowNumber, updatedRow);
      return next;
    });

    // If the row became validated, auto-select it
    if (updatedRow.status === 'validated') {
      setSelectedRows((prev) => {
        const next = new Set(prev);
        next.add(rowNumber);
        return next;
      });
    }
  };

  const handleToggleRow = (rowNumber: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowNumber)) {
        next.delete(rowNumber);
      } else {
        next.add(rowNumber);
      }
      return next;
    });
  };

  const handleToggleAll = (rowNumbers: number[]) => {
    const allSelected = rowNumbers.every((n) => selectedRows.has(n));
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        rowNumbers.forEach((n) => next.delete(n));
      } else {
        rowNumbers.forEach((n) => next.add(n));
      }
      return next;
    });
  };

  const handleConfirmImport = async () => {
    if (!preview || selectedRows.size === 0) return;

    try {
      setPhase('importing');
      setError(null);

      // Collect rows to import (use updated version if available)
      const rowsToImport = [...selectedRows].map((rowNumber) => {
        // Check if we have an updated version of this row
        const updatedRow = updatedRows.get(rowNumber);
        if (updatedRow) {
          return { row_number: rowNumber, data: updatedRow.data };
        }

        // Find the original row
        const originalRow =
          preview.validated_rows.find((r) => r.row_number === rowNumber) ||
          preview.problematic_rows.find((r) => r.row_number === rowNumber);

        if (originalRow) {
          return { row_number: rowNumber, data: originalRow.data };
        }

        throw new Error(`Row ${rowNumber} not found`);
      });

      const importResult = await confirmImport({ rows: rowsToImport });
      setResult(importResult);
      setPhase('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setPhase('preview');
    }
  };

  // Get effective preview with updated rows
  const getEffectivePreview = (): ImportPreviewResult | null => {
    if (!preview) return null;

    // Move updated rows from problematic to validated if they passed validation
    const stillProblematic: ImportPreviewRow[] = [];
    const nowValidated: ImportPreviewRow[] = [...preview.validated_rows];

    for (const row of preview.problematic_rows) {
      const updated = updatedRows.get(row.row_number);
      if (updated && updated.status === 'validated') {
        nowValidated.push(updated);
      } else {
        stillProblematic.push(updated || row);
      }
    }

    return {
      ...preview,
      validated_rows: nowValidated,
      problematic_rows: stillProblematic,
    };
  };

  const effectivePreview = getEffectivePreview();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: phase === 'preview' ? 800 : 500, maxHeight: '90vh', overflow: 'auto' }}
      >
        <div className="modal-header">
          <h2>
            {phase === 'upload' && 'Import from CSV'}
            {phase === 'preview' && 'Preview Import'}
            {phase === 'importing' && 'Importing...'}
            {phase === 'result' && 'Import Complete'}
          </h2>
          <button onClick={onClose}>&times;</button>
        </div>

        {phase === 'upload' && (
          <>
            <p style={{ marginBottom: 16 }}>
              Select a CSV file to import equipment records. You'll be able to preview
              and fix any issues before importing.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}

            <div className="modal-actions">
              <button onClick={onClose} className="secondary">
                Cancel
              </button>
              <button
                onClick={handleSelectFile}
                className="primary"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Select CSV File'}
              </button>
            </div>
          </>
        )}

        {phase === 'preview' && effectivePreview && (
          <>
            <ImportPreview
              preview={effectivePreview}
              onRowUpdate={handleRowUpdate}
              selectedRows={selectedRows}
              onToggleRow={handleToggleRow}
              onToggleAll={handleToggleAll}
            />

            {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}

            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button onClick={onClose} className="secondary">
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="primary"
                disabled={selectedRows.size === 0}
              >
                Import {selectedRows.size} Selected Row{selectedRows.size !== 1 ? 's' : ''}
              </button>
            </div>
          </>
        )}

        {phase === 'importing' && (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div>Importing {selectedRows.size} rows...</div>
          </div>
        )}

        {phase === 'result' && result && (
          <>
            <div style={{ marginBottom: 16 }}>
              <table style={{ marginTop: 16 }}>
                <tbody>
                  <tr>
                    <td>Total Rows:</td>
                    <td>{result.total_rows}</td>
                  </tr>
                  <tr>
                    <td>Created:</td>
                    <td className="success">{result.created}</td>
                  </tr>
                  <tr>
                    <td>Updated:</td>
                    <td>{result.updated}</td>
                  </tr>
                  <tr>
                    <td>Restored:</td>
                    <td>{result.restored}</td>
                  </tr>
                  <tr>
                    <td>Failed:</td>
                    <td className={result.failed > 0 ? 'error' : ''}>
                      {result.failed}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {result.errors.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4>Errors</h4>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {result.errors.map((err, idx) => (
                    <div key={idx} className="error" style={{ marginBottom: 4 }}>
                      Row {err.row} ({err.serial_number || 'unknown'}): {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button onClick={onClose} className="primary">
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
