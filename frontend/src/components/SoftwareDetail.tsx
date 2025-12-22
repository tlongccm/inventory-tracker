/**
 * SoftwareDetail component - displays all fields for a selected software.
 */

import type { Software } from '../types/software';
import MarkdownRenderer from './MarkdownRenderer';

interface SoftwareDetailProps {
  software: Software | null;
  loading: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
}

function formatCost(cost: number | null): string {
  if (cost === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cost);
}

export default function SoftwareDetail({
  software,
  loading,
  onEdit,
  onDelete,
  onClose,
}: SoftwareDetailProps) {
  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="loading">Loading details...</div>
        </div>
      </div>
    );
  }

  if (!software) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {software.software_id} - {software.name}
          </h2>
          <button onClick={onClose}>&times;</button>
        </div>

        {/* Core Information */}
        <div className="detail-section">
          <h3>Core Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Software ID</label>
              <span>{software.software_id}</span>
            </div>
            <div className="detail-item">
              <label>Name</label>
              <span>{software.name}</span>
            </div>
            <div className="detail-item">
              <label>Category</label>
              <span>{software.category || '-'}</span>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <span>{software.status || '-'}</span>
            </div>
          </div>
        </div>

        {/* License Information */}
        <div className="detail-section">
          <h3>License Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Type</label>
              <span>{software.type || '-'}</span>
            </div>
            <div className="detail-item">
              <label>Version</label>
              <span>{software.version || '-'}</span>
            </div>
            <div className="detail-item">
              <label>License Key</label>
              <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {software.key || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Purchase Information */}
        <div className="detail-section">
          <h3>Purchase Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Purchase Date</label>
              <span>{formatDate(software.purchase_date)}</span>
            </div>
            <div className="detail-item">
              <label>Purchaser</label>
              <span>{software.purchaser || '-'}</span>
            </div>
            <div className="detail-item">
              <label>Vendor</label>
              <span>{software.vendor || '-'}</span>
            </div>
            <div className="detail-item">
              <label>Cost</label>
              <span>{formatCost(software.cost)}</span>
            </div>
          </div>
        </div>

        {/* Deployment Details */}
        <div className="detail-section">
          <h3>Deployment Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Deployment</label>
              <span>{software.deployment || '-'}</span>
            </div>
            <div className="detail-item">
              <label>Installation File Location</label>
              <span style={{ wordBreak: 'break-all' }}>
                {software.install_location || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Comments */}
        {software.comments && (
          <div className="detail-section">
            <h3>Comments</h3>
            <MarkdownRenderer content={software.comments} />
          </div>
        )}

        {/* Metadata */}
        <div className="detail-section">
          <h3>Metadata</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Created</label>
              <span>{formatDate(software.created_at)}</span>
            </div>
            <div className="detail-item">
              <label>Last Updated</label>
              <span>{formatDate(software.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button onClick={onEdit} className="primary">
            Edit
          </button>
          <button onClick={onDelete} className="danger">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
