/**
 * SubscriptionImportModal component - modal for importing subscriptions from CSV.
 */

import { useState, useRef } from 'react';
import type { SubscriptionImportResult } from '../types/subscription';

interface SubscriptionImportModalProps {
  onImport: (file: File) => Promise<SubscriptionImportResult>;
  onClose: () => void;
}

export default function SubscriptionImportModal({
  onImport,
  onClose,
}: SubscriptionImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<SubscriptionImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);

    try {
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
          <h2>Import Subscriptions</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error">{error}</div>}

          {!result ? (
            <>
              <p>Select a CSV file to import subscriptions.</p>
              <p className="text-muted">
                The CSV should include headers matching the subscription fields.
                Existing subscriptions will be updated, new ones will be created.
              </p>

              <div className="file-upload">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="secondary"
                  onClick={handleSelectFile}
                >
                  Select File
                </button>
                {file && (
                  <span className="file-name">{file.name}</span>
                )}
              </div>
            </>
          ) : (
            <div className="import-results">
              <h3>Import Complete</h3>
              <div className="result-stats">
                <div className="stat">
                  <span className="stat-label">Total Rows</span>
                  <span className="stat-value">{result.total_rows}</span>
                </div>
                <div className="stat success">
                  <span className="stat-label">Created</span>
                  <span className="stat-value">{result.created}</span>
                </div>
                <div className="stat success">
                  <span className="stat-label">Updated</span>
                  <span className="stat-value">{result.updated}</span>
                </div>
                <div className="stat success">
                  <span className="stat-label">Restored</span>
                  <span className="stat-value">{result.restored}</span>
                </div>
                <div className="stat error">
                  <span className="stat-label">Failed</span>
                  <span className="stat-value">{result.failed}</span>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="import-errors">
                  <h4>Errors</h4>
                  <ul>
                    {result.errors.map((err, index) => (
                      <li key={index}>
                        Row {err.row} ({err.provider}): {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {!result ? (
            <>
              <button
                className="primary"
                onClick={handleImport}
                disabled={!file || importing}
              >
                {importing ? 'Importing...' : 'Import'}
              </button>
              <button className="secondary" onClick={onClose}>
                Cancel
              </button>
            </>
          ) : (
            <button className="primary" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
