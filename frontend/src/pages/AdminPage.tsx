/**
 * AdminPage - admin section for viewing and restoring deleted equipment.
 */

import { useState, useEffect, useCallback } from 'react';
import type { EquipmentListItem } from '../types/equipment';
import { listDeletedEquipment, restoreEquipment } from '../services/api';
import AdminPanel from '../components/AdminPanel';

export default function AdminPage() {
  const [equipment, setEquipment] = useState<EquipmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDeletedEquipment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listDeletedEquipment();
      setEquipment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deleted equipment');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeletedEquipment();
  }, [loadDeletedEquipment]);

  const handleRestore = async (equipmentId: string) => {
    if (!window.confirm(`Are you sure you want to restore this equipment?`)) {
      return;
    }

    try {
      await restoreEquipment(equipmentId);
      loadDeletedEquipment();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore equipment');
    }
  };

  return (
    <div>
      <h1>Admin - Deleted Equipment</h1>

      {error && (
        <div className="error" style={{ marginBottom: 16 }}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 8 }}>
            Dismiss
          </button>
        </div>
      )}

      <p style={{ marginBottom: 16 }}>
        This section shows soft-deleted equipment that can be restored.
      </p>

      <AdminPanel
        equipment={equipment}
        loading={loading}
        onRestore={handleRestore}
      />
    </div>
  );
}
