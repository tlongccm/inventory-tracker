/**
 * AssignmentHistory component - displays past and current assignments for equipment.
 */

import type { AssignmentHistoryItem, Equipment } from '../types/equipment';
import { buildAssignmentHistory } from '../utils/assignmentHistory';
import type { AssignmentHistoryRecord } from '../utils/assignmentHistory';

interface AssignmentHistoryProps {
  history: AssignmentHistoryItem[];
  loading: boolean;
  equipmentId: string;
  equipment?: Equipment | null;
  onClose: () => void;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
}

export default function AssignmentHistory({
  history,
  loading,
  equipmentId,
  equipment,
  onClose,
}: AssignmentHistoryProps) {
  // Build combined history with current assignment
  const records: AssignmentHistoryRecord[] = equipment
    ? buildAssignmentHistory(equipment, history)
    : history.map((h) => ({
        id: h.id,
        user: h.previous_user,
        usageType: h.previous_usage_type,
        equipmentName: h.previous_equipment_name,
        startDate: h.start_date,
        endDate: h.end_date,
        isCurrent: false,
      }));

  const hasNoAssignments = records.length === 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assignment History - {equipmentId}</h2>
          <button onClick={onClose}>&times;</button>
        </div>

        {loading ? (
          <div className="loading">Loading history...</div>
        ) : hasNoAssignments ? (
          <div className="empty-state">
            <p>No assignments found.</p>
            <p>This equipment has never been assigned to a user.</p>
          </div>
        ) : (
          <div className="history-list">
            {records.map((record) => (
              <div
                key={record.id}
                className={`history-item ${record.isCurrent ? 'current' : ''}`}
              >
                <div>
                  <strong>{record.user || 'Unassigned'}</strong>
                  {record.isCurrent && <span className="current-badge">Current</span>}
                  {record.usageType && <span> ({record.usageType})</span>}
                </div>
                {record.equipmentName && (
                  <div>Equipment Name: {record.equipmentName}</div>
                )}
                <div className="dates">
                  {formatDate(record.startDate)}
                  {record.isCurrent ? ' - Present' : ` - ${formatDate(record.endDate)}`}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose} className="secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
