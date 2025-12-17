/**
 * EquipmentForm component - form for creating and editing equipment.
 */

import { useState } from 'react';
import type {
  Equipment,
  EquipmentCreate,
  EquipmentUpdate,
  EquipmentType,
  ComputerSubtype,
  Status,
  UsageType,
} from '../types/equipment';

interface EquipmentFormProps {
  equipment: Equipment | null;
  onSave: (data: EquipmentCreate | EquipmentUpdate) => Promise<void>;
  onClose: () => void;
}

const EQUIPMENT_TYPES: EquipmentType[] = ['PC', 'Monitor', 'Scanner', 'Printer'];
const COMPUTER_SUBTYPES: ComputerSubtype[] = ['Desktop', 'Laptop'];
const STATUSES: Status[] = ['Active', 'Inactive', 'Decommissioned', 'In Repair', 'In Storage'];
const USAGE_TYPES: UsageType[] = ['Personal', 'Work'];

export default function EquipmentForm({
  equipment,
  onSave,
  onClose,
}: EquipmentFormProps) {
  const isEdit = equipment !== null;

  // Form state
  const [formData, setFormData] = useState({
    equipment_type: equipment?.equipment_type || 'PC',
    serial_number: equipment?.serial_number || '',
    model: equipment?.model || '',
    manufacturer: equipment?.manufacturer || '',
    computer_subtype: equipment?.computer_subtype || '',
    cpu_model: equipment?.cpu_model || '',
    cpu_speed: equipment?.cpu_speed || '',
    operating_system: equipment?.operating_system || '',
    ram: equipment?.ram || '',
    storage: equipment?.storage || '',
    video_card: equipment?.video_card || '',
    display_resolution: equipment?.display_resolution || '',
    mac_address: equipment?.mac_address || '',
    manufacturing_date: equipment?.manufacturing_date || '',
    acquisition_date: equipment?.acquisition_date || '',
    location: equipment?.location || '',
    cost: equipment?.cost?.toString() || '',
    cpu_score: equipment?.cpu_score?.toString() || '',
    score_2d: equipment?.score_2d?.toString() || '',
    score_3d: equipment?.score_3d?.toString() || '',
    memory_score: equipment?.memory_score?.toString() || '',
    disk_score: equipment?.disk_score?.toString() || '',
    overall_rating: equipment?.overall_rating?.toString() || '',
    equipment_name: equipment?.equipment_name || '',
    ip_address: equipment?.ip_address || '',
    assignment_date: equipment?.assignment_date || '',
    primary_user: equipment?.primary_user || '',
    usage_type: equipment?.usage_type || '',
    status: equipment?.status || 'Active',
    notes: equipment?.notes || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!isEdit && !formData.serial_number.trim()) {
      setError('Serial Number is required');
      return;
    }

    if (!isEdit && !formData.equipment_type) {
      setError('Equipment Type is required');
      return;
    }

    try {
      setSaving(true);

      // Build data object, converting strings to appropriate types
      const data: EquipmentCreate | EquipmentUpdate = {
        ...(isEdit ? {} : {
          equipment_type: formData.equipment_type as EquipmentType,
          serial_number: formData.serial_number,
        }),
        model: formData.model || undefined,
        manufacturer: formData.manufacturer || undefined,
        computer_subtype: formData.computer_subtype as ComputerSubtype || undefined,
        cpu_model: formData.cpu_model || undefined,
        cpu_speed: formData.cpu_speed || undefined,
        operating_system: formData.operating_system || undefined,
        ram: formData.ram || undefined,
        storage: formData.storage || undefined,
        video_card: formData.video_card || undefined,
        display_resolution: formData.display_resolution || undefined,
        mac_address: formData.mac_address || undefined,
        manufacturing_date: formData.manufacturing_date || undefined,
        acquisition_date: formData.acquisition_date || undefined,
        location: formData.location || undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        cpu_score: formData.cpu_score ? parseInt(formData.cpu_score) : undefined,
        score_2d: formData.score_2d ? parseInt(formData.score_2d) : undefined,
        score_3d: formData.score_3d ? parseInt(formData.score_3d) : undefined,
        memory_score: formData.memory_score ? parseInt(formData.memory_score) : undefined,
        disk_score: formData.disk_score ? parseInt(formData.disk_score) : undefined,
        overall_rating: formData.overall_rating ? parseInt(formData.overall_rating) : undefined,
        equipment_name: formData.equipment_name || undefined,
        ip_address: formData.ip_address || undefined,
        assignment_date: formData.assignment_date || undefined,
        primary_user: formData.primary_user || undefined,
        usage_type: formData.usage_type as UsageType || undefined,
        status: formData.status as Status || undefined,
        notes: formData.notes || undefined,
      };

      await onSave(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const isPc = formData.equipment_type === 'PC';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Equipment' : 'Add Equipment'}</h2>
          <button onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Core Fields */}
          <div className="detail-section">
            <h3>Core Information</h3>
            <div className="detail-grid">
              <div className="form-group">
                <label htmlFor="equipment_type">Equipment Type *</label>
                <select
                  id="equipment_type"
                  name="equipment_type"
                  value={formData.equipment_type}
                  onChange={handleChange}
                  disabled={isEdit}
                  required
                >
                  {EQUIPMENT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="serial_number">Serial Number *</label>
                <input
                  type="text"
                  id="serial_number"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleChange}
                  disabled={isEdit}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="detail-section">
            <h3>Specifications</h3>
            <div className="detail-grid">
              <div className="form-group">
                <label htmlFor="model">Model</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="manufacturer">Manufacturer</label>
                <input
                  type="text"
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                />
              </div>
              {isPc && (
                <>
                  <div className="form-group">
                    <label htmlFor="computer_subtype">Subtype</label>
                    <select
                      id="computer_subtype"
                      name="computer_subtype"
                      value={formData.computer_subtype}
                      onChange={handleChange}
                    >
                      <option value="">Select...</option>
                      {COMPUTER_SUBTYPES.map((subtype) => (
                        <option key={subtype} value={subtype}>{subtype}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="cpu_model">CPU Model</label>
                    <input
                      type="text"
                      id="cpu_model"
                      name="cpu_model"
                      value={formData.cpu_model}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cpu_speed">CPU Speed</label>
                    <input
                      type="text"
                      id="cpu_speed"
                      name="cpu_speed"
                      value={formData.cpu_speed}
                      onChange={handleChange}
                      placeholder="e.g., 3.5 GHz"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="operating_system">Operating System</label>
                    <input
                      type="text"
                      id="operating_system"
                      name="operating_system"
                      value={formData.operating_system}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ram">RAM</label>
                    <input
                      type="text"
                      id="ram"
                      name="ram"
                      value={formData.ram}
                      onChange={handleChange}
                      placeholder="e.g., 16 GB"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="storage">Storage</label>
                    <input
                      type="text"
                      id="storage"
                      name="storage"
                      value={formData.storage}
                      onChange={handleChange}
                      placeholder="e.g., 512 GB SSD"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="video_card">Video Card</label>
                    <input
                      type="text"
                      id="video_card"
                      name="video_card"
                      value={formData.video_card}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="display_resolution">Display Resolution</label>
                    <input
                      type="text"
                      id="display_resolution"
                      name="display_resolution"
                      value={formData.display_resolution}
                      onChange={handleChange}
                      placeholder="e.g., 1920x1080"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="mac_address">MAC Address</label>
                    <input
                      type="text"
                      id="mac_address"
                      name="mac_address"
                      value={formData.mac_address}
                      onChange={handleChange}
                      placeholder="XX:XX:XX:XX:XX:XX"
                    />
                  </div>
                </>
              )}
              <div className="form-group">
                <label htmlFor="manufacturing_date">Manufacturing Date</label>
                <input
                  type="date"
                  id="manufacturing_date"
                  name="manufacturing_date"
                  value={formData.manufacturing_date}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="acquisition_date">Acquisition Date</label>
                <input
                  type="date"
                  id="acquisition_date"
                  name="acquisition_date"
                  value={formData.acquisition_date}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Office 201, Building A"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cost">Cost</label>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Performance (PC Only) */}
          {isPc && (
            <div className="detail-section">
              <h3>Performance (Passmark)</h3>
              <div className="detail-grid">
                <div className="form-group">
                  <label htmlFor="cpu_score">CPU Score</label>
                  <input
                    type="number"
                    id="cpu_score"
                    name="cpu_score"
                    value={formData.cpu_score}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="score_2d">2D Score</label>
                  <input
                    type="number"
                    id="score_2d"
                    name="score_2d"
                    value={formData.score_2d}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="score_3d">3D Score</label>
                  <input
                    type="number"
                    id="score_3d"
                    name="score_3d"
                    value={formData.score_3d}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="memory_score">Memory Score</label>
                  <input
                    type="number"
                    id="memory_score"
                    name="memory_score"
                    value={formData.memory_score}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="disk_score">Disk Score</label>
                  <input
                    type="number"
                    id="disk_score"
                    name="disk_score"
                    value={formData.disk_score}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="overall_rating">Overall Rating</label>
                  <input
                    type="number"
                    id="overall_rating"
                    name="overall_rating"
                    value={formData.overall_rating}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Assignment */}
          <div className="detail-section">
            <h3>Assignment</h3>
            <div className="detail-grid">
              <div className="form-group">
                <label htmlFor="equipment_name">Equipment Name</label>
                <input
                  type="text"
                  id="equipment_name"
                  name="equipment_name"
                  value={formData.equipment_name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ip_address">IP Address</label>
                <input
                  type="text"
                  id="ip_address"
                  name="ip_address"
                  value={formData.ip_address}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="primary_user">Primary User</label>
                <input
                  type="text"
                  id="primary_user"
                  name="primary_user"
                  value={formData.primary_user}
                  onChange={handleChange}
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

          {/* Notes */}
          <div className="detail-section">
            <h3>Notes</h3>
            <div className="form-group">
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="secondary">
              Cancel
            </button>
            <button type="submit" className="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
