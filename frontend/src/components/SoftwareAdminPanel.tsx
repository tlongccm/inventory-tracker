/**
 * SoftwareAdminPanel component - displays deleted software for recovery.
 */

import type { SoftwareListItem } from '../types/software';

interface SoftwareAdminPanelProps {
  software: SoftwareListItem[];
  loading: boolean;
  onRestore: (id: number) => void;
}

export default function SoftwareAdminPanel({
  software,
  loading,
  onRestore,
}: SoftwareAdminPanelProps) {
  if (loading) {
    return <div className="loading">Loading deleted software...</div>;
  }

  if (software.length === 0) {
    return (
      <div className="empty-state">
        <h3>No deleted software</h3>
        <p>There are no soft-deleted software records to restore.</p>
      </div>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Software ID</th>
          <th>Name</th>
          <th>Category</th>
          <th>Version</th>
          <th>Vendor</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {software.map((item) => (
          <tr key={item.software_id}>
            <td>{item.software_id}</td>
            <td>{item.name}</td>
            <td>{item.category || '-'}</td>
            <td>{item.version || '-'}</td>
            <td>{item.vendor || '-'}</td>
            <td>{item.status || '-'}</td>
            <td>
              <button
                className="primary"
                onClick={() => onRestore(item.id)}
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
