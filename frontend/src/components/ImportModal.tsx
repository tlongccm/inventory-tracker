/**
 * ImportModal component - CSV file upload and import results display.
 */

import { useState, useRef } from 'react';
import type { ImportResult } from '../types/equipment';

interface ImportModalProps {
  onImport: (file: File) => Promise<ImportResult>;
  onClose: () => void;
}

export default function ImportModal({ onImport, onClose }: ImportModalProps) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
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
          <h2>Import from CSV</h2>
          <button onClick={onClose}>&times;</button>
        </div>

        {!result ? (
          <>
            <p style={{ marginBottom: 16 }}>
              Select a CSV file to import equipment records. Existing records will be
              updated by Serial Number. New records will be created.
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
