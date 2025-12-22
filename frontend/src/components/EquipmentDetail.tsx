/**
 * EquipmentDetail component - displays all fields for a selected equipment.
 */

import type { Equipment } from '../types/equipment';
import MarkdownRenderer from './MarkdownRenderer';

interface EquipmentDetailProps {
  equipment: Equipment | null;
  loading: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onViewHistory: () => void;
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

export default function EquipmentDetail({
  equipment,
  loading,
  onEdit,
  onDelete,
  onViewHistory,
  onClose,
}: EquipmentDetailProps) {
  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="loading">Loading details...</div>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {equipment.equipment_id} - {equipment.equipment_name || 'Unnamed'}
          </h2>
          <button onClick={onClose}>&times;</button>
        </div>

        {/* Core Information */}
        <div className="detail-section">
          <h3>Core Information</h3>
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
              <label>Status</label>
              <span>{equipment.status}</span>
            </div>
            <div className="detail-item">
              <label>Location</label>
              <span>{equipment.location || '-'}</span>
            </div>
            <div className="detail-item">
              <label>Purpose</label>
              <span>{equipment.purpose || '-'}</span>
            </div>
            <div className="detail-item">
              <label>Ownership</label>
              <span>{equipment.ownership || '-'}</span>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="detail-section">
          <h3>Specifications</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Serial Number</label>
              <span>{equipment.serial_number}</span>
            </div>
            <div className="detail-item">
              <label>Model</label>
              <span>{equipment.model || '-'}</span>
            </div>
            <div className="detail-item">
              <label>Manufacturer</label>
              <span>{equipment.manufacturer || '-'}</span>
            </div>
            <div className="detail-item">
              <label>Manufacturing Date</label>
              <span>{formatDate(equipment.manufacturing_date)}</span>
            </div>
            {equipment.equipment_type === 'PC' && (
              <>
                <div className="detail-item">
                  <label>Subtype</label>
                  <span>{equipment.computer_subtype || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>CPU Model</label>
                  <span>{equipment.cpu_model || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>CPU Speed</label>
                  <span>{equipment.cpu_speed || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Operating System</label>
                  <span>{equipment.operating_system || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>RAM</label>
                  <span>{equipment.ram || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Storage</label>
                  <span>{equipment.storage || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Video Card</label>
                  <span>{equipment.video_card || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Display Resolution</label>
                  <span>{equipment.display_resolution || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>MAC (LAN)</label>
                  <span>{equipment.mac_lan || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>MAC (WLAN)</label>
                  <span>{equipment.mac_wlan || '-'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Performance (PC Only) */}
        {equipment.equipment_type === 'PC' && (
          <div className="detail-section">
            <h3>Performance (Passmark)</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>CPU Score</label>
                <span>{equipment.cpu_score ?? '-'}</span>
              </div>
              <div className="detail-item">
                <label>2D Score</label>
                <span>{equipment.score_2d ?? '-'}</span>
              </div>
              <div className="detail-item">
                <label>3D Score</label>
                <span>{equipment.score_3d ?? '-'}</span>
              </div>
              <div className="detail-item">
                <label>Memory Score</label>
                <span>{equipment.memory_score ?? '-'}</span>
              </div>
              <div className="detail-item">
                <label>Disk Score</label>
                <span>{equipment.disk_score ?? '-'}</span>
              </div>
              <div className="detail-item">
                <label>Overall Rating</label>
                <span>{equipment.overall_rating ?? '-'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Assignment */}
        <div className="detail-section">
          <h3>Assignment</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Equipment Name</label>
              <span>{equipment.equipment_name || '-'}</span>
            </div>
            <div className="detail-item">
              <label>IP Address</label>
              <span>{equipment.ip_address || '-'}</span>
            </div>
            <div className="detail-item">
              <label>Primary User</label>
              <span>{equipment.primary_user || '-'}</span>
            </div>
            <div className="detail-item">
              <label>Usage Type</label>
              <span>{equipment.usage_type || '-'}</span>
            </div>
            <div className="detail-item">
              <label>Assignment Date</label>
              <span>{formatDate(equipment.assignment_date)}</span>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="detail-section">
          <h3>History</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Acquisition Date</label>
              <span>{formatDate(equipment.acquisition_date)}</span>
            </div>
            <div className="detail-item">
              <label>Cost</label>
              <span>{formatCost(equipment.cost)}</span>
            </div>
          </div>
          {equipment.notes && (
            <div className="detail-item" style={{ marginTop: '1rem' }}>
              <label>Notes</label>
              <MarkdownRenderer content={equipment.notes} />
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="detail-section">
          <h3>Metadata</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Created</label>
              <span>{formatDate(equipment.created_at)}</span>
            </div>
            <div className="detail-item">
              <label>Last Updated</label>
              <span>{formatDate(equipment.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button onClick={onViewHistory} className="secondary">
            View History
          </button>
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
