/**
 * ReassignmentModal component - modal for reassigning equipment to a new user.
 * Displays equipment info (read-only) and editable assignment fields.
 */

import { useState } from 'react';
import type { Equipment, EquipmentUpdate, UsageType } from '../types/equipment';

interface ReassignmentModalProps {
  equipment: Equipment;
  onSave: (data: EquipmentUpdate) => Promise<void>;
  onClose: () => void;
}

const USAGE_TYPES: UsageType[] = ['Personal', 'Work'];

export default function ReassignmentModal({
  equipment,
  onSave,
  onClose,
}: ReassignmentModalProps) {
  // Form state for editable assignment fields
  const [formData, setFormData] = useState({
    equipment_name: equipment.equipment_name || '',
    primary_user: '',
    usage_type: equipment.usage_type || '',
    ip_address: equipment.ip_address || '',
    assignment_date: new Date().toISOString().split('T')[0],
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.primary_user.trim()) {
      setError('New Primary User is required');
      return;
    }

    try {
      setSaving(true);

      const data: EquipmentUpdate = {
        equipment_name: formData.equipment_name || undefined,
        primary_user: formData.primary_user,
        usage_type: formData.usage_type as UsageType || undefined,
        ip_address: formData.ip_address || undefined,
        assignment_date: formData.assignment_date || undefined,
      };

      await onSave(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reassign');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reassign Equipment</h2>
          <button onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Equipment Info - Read Only */}
          <div className="detail-section reassignment-info">
            <h3>Equipment Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Equipment ID</label>
                <span>{equipment.equipment_id}</span>
              </div>
              <div className="detail-item">
                <label>Type</label>
                <span>{equipment.equipment_type}</span>
              </div>
              <div className="detail-item">
                <label>Model</label>
                <span>{equipment.model || '-'}</span>
              </div>
              <div className="detail-item">
                <label>Serial Number</label>
                <span>{equipment.serial_number}</span>
              </div>
            </div>
          </div>

          {/* Previous Assignment - Reference */}
          <div className="detail-section reassignment-previous">
            <h3>Previous Assignment</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Previous User</label>
                <span>{equipment.primary_user || 'Unassigned'}</span>
              </div>
              <div className="detail-item">
                <label>Previous Usage Type</label>
                <span>{equipment.usage_type || '-'}</span>
              </div>
              <div className="detail-item">
                <label>Previous Equipment Name</label>
                <span>{equipment.equipment_name || '-'}</span>
              </div>
            </div>
          </div>

          {/* New Assignment - Editable */}
          <div className="detail-section reassignment-new">
            <h3>New Assignment</h3>
            <div className="detail-grid">
              <div className="form-group">
                <label htmlFor="primary_user">New Primary User *</label>
                <input
                  type="text"
                  id="primary_user"
                  name="primary_user"
                  value={formData.primary_user}
                  onChange={handleChange}
                  placeholder="Enter new user name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="equipment_name">Equipment Name</label>
                <input
                  type="text"
                  id="equipment_name"
                  name="equipment_name"
                  value={formData.equipment_name}
                  onChange={handleChange}
                  placeholder="Hostname"
                />
              </div>
              <div className="form-group">
                <label htmlFor="usage_type">Usage Type</label>
                <select
                  id="usage_type"
                  name="usage_type"
                  value={formData.usage_type}
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  {USAGE_TYPES.map((ut) => (
                    <option key={ut} value={ut}>{ut}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="ip_address">IP Address</label>
                <input
                  type="text"
                  id="ip_address"
                  name="ip_address"
                  value={formData.ip_address}
                  onChange={handleChange}
                  placeholder="192.168.1.1"
                />
              </div>
              <div className="form-group">
                <label htmlFor="assignment_date">Assignment Date</label>
                <input
                  type="date"
                  id="assignment_date"
                  name="assignment_date"
                  value={formData.assignment_date}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="secondary">
              Cancel
            </button>
            <button type="submit" className="primary" disabled={saving}>
              {saving ? 'Reassigning...' : 'Reassign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
