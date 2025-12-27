/**
 * InventoryPage - main page combining equipment list, detail view, and actions.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type {
  Equipment,
  EquipmentListItem,
  EquipmentCreate,
  EquipmentUpdate,
  AssignmentHistoryItem,
  ImportResult,
} from '../types/equipment';
import {
  listEquipment,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentHistory,
  exportEquipment,
  importEquipment,
} from '../services/api';
import EquipmentList, { type EquipmentListHandle } from '../components/EquipmentList';
import EquipmentDetail from '../components/EquipmentDetail';
import EquipmentForm from '../components/EquipmentForm';
import AssignmentHistory from '../components/AssignmentHistory';
import ImportModal from '../components/ImportModal';
import ReassignmentModal from '../components/ReassignmentModal';
import ViewGroupToggle from '../components/ViewGroupToggle';
import SearchBox from '../components/SearchBox';
import ShareLinkButton from '../components/ShareLinkButton';
import { useViewPreferences } from '../hooks/useViewPreferences';
import { filterEquipment, validateRegex } from '../utils/search';
import { useSearchParams } from 'react-router-dom';
import { parseUrlParams, serializeFilters } from '../utils/urlParams';

export default function InventoryPage() {
  // URL params
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [equipment, setEquipment] = useState<EquipmentListItem[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<AssignmentHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [reassignEquipment, setReassignEquipment] = useState<Equipment | null>(null);

  // View preferences and refs
  const { preferences, toggleGroup } = useViewPreferences();
  const equipmentListRef = useRef<EquipmentListHandle>(null);
  const [searchTerm, setSearchTerm] = useState(() => {
    const params = parseUrlParams(searchParams);
    return (params.search as string) || '';
  });
  const [isRegex, setIsRegex] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Filter equipment based on search term
  const filteredEquipment = useMemo(() => {
    if (!searchTerm.trim()) {
      return equipment;
    }
    // Validate regex if in regex mode
    if (isRegex) {
      const validation = validateRegex(searchTerm);
      if (!validation.valid) {
        setSearchError(validation.error || 'Invalid regex');
        return equipment; // Return unfiltered on invalid regex
      }
    }
    setSearchError(null);
    return filterEquipment(equipment as unknown as Equipment[], searchTerm, isRegex) as unknown as EquipmentListItem[];
  }, [equipment, searchTerm, isRegex]);

  // Handle search term change
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    // Clear error when term changes
    if (!term.trim()) {
      setSearchError(null);
    }
  }, []);

  // Handle regex toggle
  const handleRegexToggle = useCallback(() => {
    setIsRegex((prev) => !prev);
    // Revalidate current term when toggling regex mode
    if (!isRegex && searchTerm.trim()) {
      const validation = validateRegex(searchTerm);
      if (!validation.valid) {
        setSearchError(validation.error || 'Invalid regex');
      } else {
        setSearchError(null);
      }
    } else {
      setSearchError(null);
    }
  }, [isRegex, searchTerm]);

  // Load equipment list
  const loadEquipment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listEquipment({});
      setEquipment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load equipment');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  // Sync search to URL
  useEffect(() => {
    const urlParams: Record<string, string | undefined> = {};
    if (searchTerm.trim()) urlParams.search = searchTerm;

    const newParams = serializeFilters(urlParams);
    setSearchParams(newParams, { replace: true });
  }, [searchTerm, setSearchParams]);

  // Select equipment to view details
  const handleSelect = async (equipmentId: string) => {
    try {
      setDetailLoading(true);
      const data = await getEquipment(equipmentId);
      setSelectedEquipment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load details');
    } finally {
      setDetailLoading(false);
    }
  };

  // Close detail view
  const handleCloseDetail = () => {
    setSelectedEquipment(null);
  };

  // Open form for adding new equipment
  const handleAdd = () => {
    setEditMode(false);
    setShowForm(true);
  };

  // Open form for editing selected equipment
  const handleEdit = () => {
    setEditMode(true);
    setShowForm(true);
  };

  // Save equipment (create or update)
  const handleSave = async (data: EquipmentCreate | EquipmentUpdate) => {
    try {
      if (editMode && selectedEquipment) {
        await updateEquipment(selectedEquipment.equipment_id, data as EquipmentUpdate);
        // Refresh details
        const updated = await getEquipment(selectedEquipment.equipment_id);
        setSelectedEquipment(updated);
      } else {
        await createEquipment(data as EquipmentCreate);
        setSelectedEquipment(null);
      }
      setShowForm(false);
      loadEquipment();
    } catch (err) {
      throw err;
    }
  };

  // Delete equipment
  const handleDelete = async () => {
    if (!selectedEquipment) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedEquipment.equipment_id}?`)) {
      return;
    }

    try {
      await deleteEquipment(selectedEquipment.equipment_id);
      setSelectedEquipment(null);
      loadEquipment();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete equipment');
    }
  };

  // View assignment history
  const handleViewHistory = async () => {
    if (!selectedEquipment) return;

    try {
      setHistoryLoading(true);
      const data = await getEquipmentHistory(selectedEquipment.equipment_id);
      setHistory(data);
      setShowHistory(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Export to CSV
  const handleExport = async () => {
    try {
      await exportEquipment();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  // Import from CSV
  const handleImport = async (file: File): Promise<ImportResult> => {
    const result = await importEquipment(file);
    loadEquipment();
    return result;
  };

  // Handle reassignment save
  const handleReassignSave = async (data: EquipmentUpdate) => {
    if (!reassignEquipment) return;

    try {
      await updateEquipment(reassignEquipment.equipment_id, data);
      setReassignEquipment(null);
      loadEquipment();
    } catch (err) {
      throw err;
    }
  };

  // Clear grid column filters
  const handleClearFilters = () => {
    equipmentListRef.current?.resetFiltersAndSort();
  };

  // Handle grid filter change notification
  const handleGridFilterChanged = useCallback((hasFilters: boolean) => {
    setHasActiveFilters(hasFilters);
  }, []);

  return (
    <div>
      <h1>Equipment Inventory</h1>

      {error && (
        <div className="error" style={{ marginBottom: 16 }}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 8 }}>
            Dismiss
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-actions">
          <button className="primary" onClick={handleAdd}>
            Add
          </button>
          <button className="secondary" onClick={handleExport}>
            Export CSV
          </button>
          <button className="secondary" onClick={() => setShowImport(true)}>
            Import CSV
          </button>
          <ShareLinkButton />
          {hasActiveFilters && (
            <button className="secondary" onClick={handleClearFilters}>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Search Box */}
      <SearchBox
        value={searchTerm}
        onChange={handleSearchChange}
        isRegex={isRegex}
        onRegexToggle={handleRegexToggle}
        error={searchError}
      />

      {/* View Group Toggle */}
      <ViewGroupToggle preferences={preferences} onToggle={toggleGroup} />

      {/* Equipment List */}
      <EquipmentList
        ref={equipmentListRef}
        equipment={filteredEquipment}
        loading={loading}
        onSelect={handleSelect}
        noResultsMessage={
          searchTerm.trim()
            ? `No equipment matches "${searchTerm}"`
            : undefined
        }
        viewPreferences={preferences}
        onFilterChanged={handleGridFilterChanged}
      />

      {/* Detail Modal */}
      {selectedEquipment && !showForm && !showHistory && (
        <EquipmentDetail
          equipment={selectedEquipment}
          loading={detailLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewHistory={handleViewHistory}
          onClose={handleCloseDetail}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <EquipmentForm
          equipment={editMode ? selectedEquipment : null}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <AssignmentHistory
          history={history}
          loading={historyLoading}
          equipmentId={selectedEquipment?.equipment_id || ''}
          equipment={selectedEquipment}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Import Modal */}
      {showImport && (
        <ImportModal
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}

      {/* Reassignment Modal */}
      {reassignEquipment && (
        <ReassignmentModal
          equipment={reassignEquipment}
          onSave={handleReassignSave}
          onClose={() => setReassignEquipment(null)}
        />
      )}
    </div>
  );
}
