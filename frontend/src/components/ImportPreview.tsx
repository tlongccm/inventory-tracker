/**
 * ImportPreview component - displays categorized import preview rows
 * with checkboxes for selection and inline editing support.
 */

import { useState } from 'react';
import type { ImportPreviewRow, ImportPreviewResult } from '../types/equipment';
import ImportRowEditor from './ImportRowEditor';

interface ImportPreviewProps {
  preview: ImportPreviewResult;
  onRowUpdate: (rowNumber: number, updatedRow: ImportPreviewRow) => void;
  selectedRows: Set<number>;
  onToggleRow: (rowNumber: number) => void;
  onToggleAll: (rowNumbers: number[]) => void;
}

export default function ImportPreview({
  preview,
  onRowUpdate,
  selectedRows,
  onToggleRow,
  onToggleAll,
}: ImportPreviewProps) {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['validated', 'problematic', 'duplicate'])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const renderRowSummary = (row: ImportPreviewRow) => {
    // Check if row has any meaningful data
    const hasData = Object.values(row.data).some((v) => v && String(v).trim());
    if (!hasData) {
      return <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Empty row (no data)</span>;
    }

    // Show key identifying fields
    const model = row.data.model || row.data.manufacturer;
    const name = row.data.equipment_name || row.data.primary_user;
    const serial = row.data.serial_number;

    const parts: string[] = [];
    if (model) parts.push(String(model));
    if (name) parts.push(String(name));
    if (serial) parts.push(`SN: ${serial}`);

    return parts.length > 0 ? parts.join(' | ') : 'No identifying info';
  };

  const renderSection = (
    title: string,
    rows: ImportPreviewRow[],
    status: 'validated' | 'problematic' | 'duplicate',
    statusClass: string
  ) => {
    if (rows.length === 0) return null;

    const rowNumbers = rows.map((r) => r.row_number);
    const allSelected = rowNumbers.every((n) => selectedRows.has(n));
    const isExpanded = expandedSections.has(status);

    return (
      <div className={`import-section import-section-${status}`} style={{ marginBottom: 16 }}>
        <div
          className="import-section-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'var(--bg-secondary)',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onClick={() => toggleSection(status)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600 }}>{title}</span>
            <span className={`badge ${statusClass}`}>{rows.length}</span>
          </div>
          <span>{isExpanded ? '▼' : '▶'}</span>
        </div>

        {isExpanded && (
          <div style={{ marginTop: 8 }}>
            {/* Column headers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: status !== 'duplicate' ? '20px 50px 90px 1fr auto' : '50px 90px 1fr',
                gap: 8,
                padding: '6px 12px',
                fontSize: '0.75em',
                color: 'var(--text-tertiary)',
                borderBottom: '1px solid var(--border-color)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {status !== 'duplicate' && (
                <div>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => onToggleAll(rowNumbers)}
                    title="Select all"
                  />
                </div>
              )}
              <div>Row</div>
              <div>Equipment ID</div>
              <div>Description</div>
              {status === 'problematic' && <div></div>}
            </div>

            {rows.map((row) => (
              <div
                key={row.row_number}
                className="import-row"
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: status !== 'duplicate' ? '20px 50px 90px 1fr auto' : '50px 90px 1fr',
                    gap: 8,
                    alignItems: 'center',
                  }}
                >
                  {status !== 'duplicate' && (
                    <div>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.row_number)}
                        onChange={() => onToggleRow(row.row_number)}
                      />
                    </div>
                  )}
                  <div style={{ fontSize: '0.85em', color: 'var(--text-tertiary)' }}>
                    {row.row_number}
                  </div>
                  <div style={{ color: row.equipment_id.includes('auto') ? 'var(--text-secondary)' : 'var(--primary)' }}>
                    {row.equipment_id}
                  </div>
                  <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>
                    {renderRowSummary(row)}
                  </div>
                  {status === 'problematic' && (
                    <button
                      onClick={() => setEditingRow(editingRow === row.row_number ? null : row.row_number)}
                      style={{ fontSize: '0.85em' }}
                    >
                      {editingRow === row.row_number ? 'Cancel' : 'Edit'}
                    </button>
                  )}
                </div>

                {editingRow === row.row_number ? (
                  <ImportRowEditor
                    row={row}
                    onSave={(updatedRow) => {
                      onRowUpdate(row.row_number, updatedRow);
                      setEditingRow(null);
                    }}
                    onCancel={() => setEditingRow(null)}
                  />
                ) : (
                  <>
                    {row.normalized_values && Object.keys(row.normalized_values).length > 0 && (
                      <div
                        style={{
                          fontSize: '0.8em',
                          color: 'var(--text-secondary)',
                          marginTop: 4,
                          marginLeft: status !== 'duplicate' ? 78 : 58,
                        }}
                      >
                        Normalized: {Object.entries(row.normalized_values)
                          .map(([k, v]) => `${k}=${v}`)
                          .join(', ')}
                      </div>
                    )}

                    {row.errors.length > 0 && (
                      <div style={{ marginTop: 4, marginLeft: status !== 'duplicate' ? 78 : 58 }}>
                        {row.errors.map((err, idx) => (
                          <div
                            key={idx}
                            className="error"
                            style={{ fontSize: '0.85em', padding: '4px 8px', marginTop: 2 }}
                          >
                            <strong>{err.field}:</strong> {err.message}
                            {err.suggestion && (
                              <span style={{ marginLeft: 8 }}>
                                Suggestion: <em>{err.suggestion}</em>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {status === 'duplicate' && (
                      <div
                        className="warning"
                        style={{
                          fontSize: '0.85em',
                          padding: '4px 8px',
                          marginTop: 4,
                          marginLeft: 58,
                        }}
                      >
                        Equipment ID already exists in database
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="import-preview">
      <div style={{ marginBottom: 16 }}>
        <strong>Total rows:</strong> {preview.total_rows} |{' '}
        <span className="success">Validated: {preview.validated_rows.length}</span> |{' '}
        <span className="warning">Problematic: {preview.problematic_rows.length}</span> |{' '}
        <span className="error">Duplicate: {preview.duplicate_rows.length}</span>
      </div>

      {renderSection('Ready to Import', preview.validated_rows, 'validated', 'success')}
      {renderSection('Needs Attention', preview.problematic_rows, 'problematic', 'warning')}
      {renderSection('Already Exists', preview.duplicate_rows, 'duplicate', 'error')}

      {preview.total_rows === 0 && (
        <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-secondary)' }}>
          No rows found in CSV file
        </div>
      )}
    </div>
  );
}
