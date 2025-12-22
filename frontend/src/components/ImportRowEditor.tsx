/**
 * ImportRowEditor component - inline editing for problematic import rows.
 */

import { useState } from 'react';
import type { ImportPreviewRow } from '../types/equipment';
import { validateRow } from '../services/api';

interface ImportRowEditorProps {
  row: ImportPreviewRow;
  onSave: (updatedRow: ImportPreviewRow) => void;
  onCancel: () => void;
}

// Fields that can be edited
const EDITABLE_FIELDS = [
  { key: 'equipment_id', label: 'Equipment ID' },
  { key: 'equipment_type', label: 'Equipment Type' },
  { key: 'serial_number', label: 'Serial Number' },
  { key: 'model', label: 'Model' },
  { key: 'manufacturer', label: 'Manufacturer' },
  { key: 'computer_subtype', label: 'Computer Subtype' },
  { key: 'ip_address', label: 'IP Address' },
  { key: 'mac_address', label: 'MAC Address' },
  { key: 'cpu_speed', label: 'CPU Speed' },
  { key: 'status', label: 'Status' },
  { key: 'usage_type', label: 'Usage Type' },
  { key: 'primary_user', label: 'Primary User' },
  { key: 'purpose', label: 'Purpose' },
];

export default function ImportRowEditor({ row, onSave, onCancel }: ImportRowEditorProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({ ...row.data });
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportPreviewRow | null>(null);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setValidationResult(null);
  };

  const handleValidate = async () => {
    try {
      setValidating(true);
      const result = await validateRow({
        row_number: row.row_number,
        data: formData,
      });
      setValidationResult(result);

      // If validated, automatically save
      if (result.status === 'validated') {
        onSave(result);
      }
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setValidating(false);
    }
  };

  // Get fields with errors for highlighting
  const errorFields = new Set(row.errors.map((e) => e.field));

  return (
    <div
      className="import-row-editor"
      style={{
        marginTop: 8,
        padding: 12,
        background: 'var(--bg-secondary)',
        borderRadius: 4,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 8,
        }}
      >
        {EDITABLE_FIELDS.map(({ key, label }) => {
          const value = formData[key] as string || '';
          const hasError = errorFields.has(key);
          const validationError = validationResult?.errors.find((e) => e.field === key);

          return (
            <div key={key}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8em',
                  marginBottom: 2,
                  color: hasError || validationError ? 'var(--error-color)' : 'inherit',
                }}
              >
                {label}
                {hasError && ' *'}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  fontSize: '0.9em',
                  borderColor: hasError || validationError ? 'var(--error-color)' : undefined,
                }}
              />
              {validationError && (
                <div style={{ fontSize: '0.75em', color: 'var(--error-color)', marginTop: 2 }}>
                  {validationError.message}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {validationResult && validationResult.status !== 'validated' && (
        <div className="warning" style={{ marginTop: 8, padding: 8, fontSize: '0.85em' }}>
          Please fix the highlighted errors and try again.
        </div>
      )}

      {validationResult && validationResult.normalized_values && Object.keys(validationResult.normalized_values).length > 0 && (
        <div style={{ marginTop: 8, fontSize: '0.85em', color: 'var(--text-secondary)' }}>
          Values will be normalized: {Object.entries(validationResult.normalized_values)
            .map(([k, v]) => `${k}="${v}"`)
            .join(', ')}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} className="secondary" style={{ fontSize: '0.9em' }}>
          Cancel
        </button>
        <button
          onClick={handleValidate}
          className="primary"
          disabled={validating}
          style={{ fontSize: '0.9em' }}
        >
          {validating ? 'Validating...' : 'Validate & Save'}
        </button>
      </div>
    </div>
  );
}
