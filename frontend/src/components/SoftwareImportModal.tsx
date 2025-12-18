/**
 * SoftwareImportModal component - CSV file upload and import results display.
 */

import { useState, useRef } from 'react';
import type { SoftwareImportResult } from '../types/software';

interface SoftwareImportModalProps {
  onImport: (file: File) => Promise<SoftwareImportResult>;
  onClose: () => void;
}

export default function SoftwareImportModal({
  onImport,
  onClose,
}: SoftwareImportModalProps) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<SoftwareImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    try {
      setImporting(true);
      setError(null);
      setResult(null);
      const importResult = await onImport(file);
      setResult(importResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import Software from CSV</h2>
          <button onClick={onClose}>&times;</button>
        </div>

        {!result ? (
          <>
            <p style={{ marginBottom: 16 }}>
              Select a CSV file to import software records. Each row will create
              a new software entry with an auto-generated Software ID.
            </p>

            <p style={{ marginBottom: 16, fontSize: '0.9em', color: '#666' }}>
              Required column: <strong>name</strong><br />
              Optional columns: category, version, key, type, purchase_date (YYYY-MM-DD),
              purchaser, vendor, cost, deployment, install_location, status, comments
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
                disabled={importing}
              >
                {importing ? 'Importing...' : 'Select CSV File'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <h3>Import Complete</h3>
              <table style={{ marginTop: 16 }}>
                <tbody>
                  <tr>
                    <td>Successfully Imported:</td>
                    <td className="success">{result.success_count}</td>
                  </tr>
                  <tr>
                    <td>Failed:</td>
                    <td className={result.error_count > 0 ? 'error' : ''}>
                      {result.error_count}
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
                      Row {err.row}{err.field ? ` (${err.field})` : ''}: {err.message}
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
