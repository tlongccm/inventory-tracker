/**
 * AdminPage - admin section for viewing and restoring deleted equipment and software.
 */

import { useState, useEffect, useCallback } from 'react';
import type { EquipmentListItem } from '../types/equipment';
import type { SoftwareListItem } from '../types/software';
import {
  listDeletedEquipment,
  restoreEquipment,
  listDeletedSoftware,
  restoreSoftware,
} from '../services/api';
import AdminPanel from '../components/AdminPanel';
import SoftwareAdminPanel from '../components/SoftwareAdminPanel';

export default function AdminPage() {
  // Equipment state
  const [equipment, setEquipment] = useState<EquipmentListItem[]>([]);
  const [equipmentLoading, setEquipmentLoading] = useState(true);

  // Software state
  const [software, setSoftware] = useState<SoftwareListItem[]>([]);
  const [softwareLoading, setSoftwareLoading] = useState(true);

  // Shared error state
  const [error, setError] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<'equipment' | 'software'>('equipment');

  const loadDeletedEquipment = useCallback(async () => {
    try {
      setEquipmentLoading(true);
      const data = await listDeletedEquipment();
      setEquipment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deleted equipment');
    } finally {
      setEquipmentLoading(false);
    }
  }, []);

  const loadDeletedSoftware = useCallback(async () => {
    try {
      setSoftwareLoading(true);
      const data = await listDeletedSoftware();
      setSoftware(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deleted software');
    } finally {
      setSoftwareLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeletedEquipment();
    loadDeletedSoftware();
  }, [loadDeletedEquipment, loadDeletedSoftware]);

  const handleRestoreEquipment = async (equipmentId: string) => {
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

  const handleRestoreSoftware = async (id: number) => {
    if (!window.confirm(`Are you sure you want to restore this software?`)) {
      return;
    }

    try {
      await restoreSoftware(id);
      loadDeletedSoftware();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore software');
    }
  };

  return (
    <div>
      <h1>Admin - Deleted Items</h1>

      {error && (
        <div className="error" style={{ marginBottom: 16 }}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 8 }}>
            Dismiss
          </button>
        </div>
      )}

      <p style={{ marginBottom: 16 }}>
        This section shows soft-deleted items that can be restored.
      </p>

      {/* Tab Navigation */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setActiveTab('equipment')}
          style={{
            marginRight: 8,
            padding: '8px 16px',
            backgroundColor: activeTab === 'equipment' ? '#1976d2' : '#e0e0e0',
            color: activeTab === 'equipment' ? 'white' : 'black',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Deleted Equipment ({equipment.length})
        </button>
        <button
          onClick={() => setActiveTab('software')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'software' ? '#1976d2' : '#e0e0e0',
            color: activeTab === 'software' ? 'white' : 'black',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Deleted Software ({software.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'equipment' ? (
        <AdminPanel
          equipment={equipment}
          loading={equipmentLoading}
          onRestore={handleRestoreEquipment}
        />
      ) : (
        <SoftwareAdminPanel
          software={software}
          loading={softwareLoading}
          onRestore={handleRestoreSoftware}
        />
      )}
    </div>
  );
}
