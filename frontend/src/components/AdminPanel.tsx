/**
 * AdminPanel component - displays deleted equipment for recovery.
 */

import type { EquipmentListItem } from '../types/equipment';

interface AdminPanelProps {
  equipment: EquipmentListItem[];
  loading: boolean;
  onRestore: (equipmentId: string) => void;
}

export default function AdminPanel({
  equipment,
  loading,
  onRestore,
}: AdminPanelProps) {
  if (loading) {
    return <div className="loading">Loading deleted equipment...</div>;
  }

  if (equipment.length === 0) {
    return (
      <div className="empty-state">
        <h3>No deleted equipment</h3>
        <p>There are no soft-deleted equipment records to restore.</p>
      </div>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Equipment ID</th>
          <th>Type</th>
          <th>Serial Number</th>
          <th>Name</th>
          <th>Model</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {equipment.map((item) => (
          <tr key={item.equipment_id}>
            <td>{item.equipment_id}</td>
            <td>{item.equipment_type}</td>
            <td>{item.serial_number || '-'}</td>
            <td>{item.equipment_name || '-'}</td>
            <td>{item.model || '-'}</td>
            <td>
              <button
                className="primary"
                onClick={() => onRestore(item.equipment_id)}
              >
                Restore
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
