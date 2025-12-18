/**
 * SoftwareForm component - form for creating and editing software.
 */

import { useState } from 'react';
import type {
  Software,
  SoftwareCreate,
  SoftwareUpdate,
} from '../types/software';
import {
  SOFTWARE_CATEGORIES,
  SOFTWARE_TYPES,
  SOFTWARE_STATUSES,
} from '../types/software';

interface SoftwareFormProps {
  software: Software | null;
  onSave: (data: SoftwareCreate | SoftwareUpdate) => Promise<void>;
  onClose: () => void;
}

export default function SoftwareForm({
  software,
  onSave,
  onClose,
}: SoftwareFormProps) {
  const isEdit = software !== null;

  // Form state
  const [formData, setFormData] = useState({
    name: software?.name || '',
    category: software?.category || '',
    categoryOther: '',
    version: software?.version || '',
    key: software?.key || '',
    type: software?.type || '',
    typeOther: '',
    purchase_date: software?.purchase_date || '',
    purchaser: software?.purchaser || '',
    vendor: software?.vendor || '',
    cost: software?.cost?.toString() || '',
    deployment: software?.deployment || '',
    install_location: software?.install_location || '',
    status: software?.status || '',
    statusOther: '',
    comments: software?.comments || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if current value is "Other" (custom value not in predefined list)
  const isCategoryOther = formData.category === 'Other' ||
    (formData.category && !SOFTWARE_CATEGORIES.includes(formData.category as typeof SOFTWARE_CATEGORIES[number]));
  const isTypeOther = formData.type === 'Other' ||
    (formData.type && !SOFTWARE_TYPES.includes(formData.type as typeof SOFTWARE_TYPES[number]));
  const isStatusOther = formData.status === 'Other' ||
    (formData.status && !SOFTWARE_STATUSES.includes(formData.status as typeof SOFTWARE_STATUSES[number]));

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
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setSaving(true);

      // Resolve "Other" values
      const resolvedCategory = formData.category === 'Other' ? formData.categoryOther : formData.category;
      const resolvedType = formData.type === 'Other' ? formData.typeOther : formData.type;
      const resolvedStatus = formData.status === 'Other' ? formData.statusOther : formData.status;

      const data: SoftwareCreate | SoftwareUpdate = {
        name: formData.name,
        category: resolvedCategory || undefined,
        version: formData.version || undefined,
        key: formData.key || undefined,
        type: resolvedType || undefined,
        purchase_date: formData.purchase_date || undefined,
        purchaser: formData.purchaser || undefined,
        vendor: formData.vendor || undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        deployment: formData.deployment || undefined,
        install_location: formData.install_location || undefined,
        status: resolvedStatus || undefined,
        comments: formData.comments || undefined,
      };

      await onSave(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Software' : 'Add Software'}</h2>
          <button onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Core Information */}
          <div className="detail-section">
            <h3>Core Information</h3>
            <div className="detail-grid">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Microsoft Office 365"
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={isCategoryOther && formData.category !== 'Other' ? 'Other' : formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  {SOFTWARE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              {(formData.category === 'Other' || isCategoryOther) && (
                <div className="form-group">
                  <label htmlFor="categoryOther">Custom Category</label>
                  <input
                    type="text"
                    id="categoryOther"
                    name="categoryOther"
                    value={formData.category === 'Other' ? formData.categoryOther : formData.category}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      category: 'Other',
                      categoryOther: e.target.value
                    }))}
                    placeholder="Enter custom category"
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={isStatusOther && formData.status !== 'Other' ? 'Other' : formData.status}
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  {SOFTWARE_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              {(formData.status === 'Other' || isStatusOther) && (
                <div className="form-group">
                  <label htmlFor="statusOther">Custom Status</label>
                  <input
                    type="text"
                    id="statusOther"
                    name="statusOther"
                    value={formData.status === 'Other' ? formData.statusOther : formData.status}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      status: 'Other',
                      statusOther: e.target.value
                    }))}
                    placeholder="Enter custom status"
                  />
                </div>
              )}
            </div>
          </div>

          {/* License Information */}
          <div className="detail-section">
            <h3>License Information</h3>
            <div className="detail-grid">
              <div className="form-group">
                <label htmlFor="type">License Type</label>
                <select
                  id="type"
                  name="type"
                  value={isTypeOther && formData.type !== 'Other' ? 'Other' : formData.type}
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  {SOFTWARE_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              {(formData.type === 'Other' || isTypeOther) && (
                <div className="form-group">
                  <label htmlFor="typeOther">Custom Type</label>
                  <input
                    type="text"
                    id="typeOther"
                    name="typeOther"
                    value={formData.type === 'Other' ? formData.typeOther : formData.type}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      type: 'Other',
                      typeOther: e.target.value
                    }))}
                    placeholder="Enter custom type"
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="version">Version</label>
                <input
                  type="text"
                  id="version"
                  name="version"
                  value={formData.version}
                  onChange={handleChange}
                  placeholder="e.g., 2023.1.0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="key">License Key</label>
                <input
                  type="text"
                  id="key"
                  name="key"
                  value={formData.key}
                  onChange={handleChange}
                  placeholder="e.g., XXXXX-XXXXX-XXXXX-XXXXX"
                />
              </div>
            </div>
          </div>

          {/* Purchase Information */}
          <div className="detail-section">
            <h3>Purchase Information</h3>
            <div className="detail-grid">
              <div className="form-group">
                <label htmlFor="purchase_date">Purchase Date</label>
                <input
                  type="date"
                  id="purchase_date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="purchaser">Purchaser</label>
                <input
                  type="text"
                  id="purchaser"
                  name="purchaser"
                  value={formData.purchaser}
                  onChange={handleChange}
                  placeholder="e.g., John Smith"
                />
              </div>
              <div className="form-group">
                <label htmlFor="vendor">Vendor</label>
                <input
                  type="text"
                  id="vendor"
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleChange}
                  placeholder="e.g., Microsoft Corporation"
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
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Deployment Details */}
          <div className="detail-section">
            <h3>Deployment Details</h3>
            <div className="detail-grid">
              <div className="form-group">
                <label htmlFor="deployment">Deployment</label>
                <input
                  type="text"
                  id="deployment"
                  name="deployment"
                  value={formData.deployment}
                  onChange={handleChange}
                  placeholder="e.g., All workstations"
                />
              </div>
              <div className="form-group">
                <label htmlFor="install_location">Installation File Location</label>
                <input
                  type="text"
                  id="install_location"
                  name="install_location"
                  value={formData.install_location}
                  onChange={handleChange}
                  placeholder="e.g., \\server\software\setup.exe"
                />
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="detail-section">
            <h3>Comments</h3>
            <div className="form-group">
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows={4}
                style={{ width: '100%' }}
                placeholder="Additional notes..."
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
