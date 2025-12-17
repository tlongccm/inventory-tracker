/**
 * InventoryPage - main page combining equipment list, detail view, and actions.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  Equipment,
  EquipmentListItem,
  EquipmentFilters,
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
import EquipmentList from '../components/EquipmentList';
import EquipmentDetail from '../components/EquipmentDetail';
import EquipmentForm from '../components/EquipmentForm';
import FilterBar from '../components/FilterBar';
import AssignmentHistory from '../components/AssignmentHistory';
import ImportModal from '../components/ImportModal';
import ReassignmentModal from '../components/ReassignmentModal';
import ViewGroupToggle from '../components/ViewGroupToggle';
import SearchBox from '../components/SearchBox';
import { useViewPreferences } from '../hooks/useViewPreferences';
import { useColumnWidths } from '../hooks/useColumnWidths';
import { getVisibleColumns } from '../utils/columns';
import { filterEquipment, validateRegex } from '../utils/search';

export default function InventoryPage() {
  // State
  const [equipment, setEquipment] = useState<EquipmentListItem[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EquipmentFilters>({});

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<AssignmentHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [reassignEquipment, setReassignEquipment] = useState<Equipment | null>(null);

  // View preferences and search state
  const { preferences, toggleGroup } = useViewPreferences();
  const { widths: columnWidths, setColumnWidth } = useColumnWidths();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegex, setIsRegex] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Calculate visible columns based on preferences
  const visibleColumns = useMemo(
    () => getVisibleColumns(preferences),
    [preferences]
  );

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
      const data = await listEquipment(filters);
      setEquipment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load equipment');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

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

  // Open reassignment modal
  const handleOpenReassign = async (equipmentId: string) => {
    try {
      setDetailLoading(true);
      const data = await getEquipment(equipmentId);
      setReassignEquipment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load equipment');
    } finally {
      setDetailLoading(false);
    }
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

  // Filter change
  const handleFilterChange = (newFilters: EquipmentFilters) => {
    setFilters(newFilters);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({});
  };

  // Handle column sort
  const handleSort = (field: string) => {
    const newOrder = filters.sort_by === field && filters.sort_order === 'asc' ? 'desc' : 'asc';
    setFilters({
      ...filters,
      sort_by: field as EquipmentFilters['sort_by'],
      sort_order: newOrder,
    });
  };

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
            Add Equipment
          </button>
          <button className="secondary" onClick={handleExport}>
            Export CSV
          </button>
          <button className="secondary" onClick={() => setShowImport(true)}>
            Import CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* View Group Toggle */}
      <ViewGroupToggle preferences={preferences} onToggle={toggleGroup} />

      {/* Search Box */}
      <SearchBox
        value={searchTerm}
        onChange={handleSearchChange}
        isRegex={isRegex}
        onRegexToggle={handleRegexToggle}
        error={searchError}
      />

      {/* Equipment List */}
      <EquipmentList
        equipment={filteredEquipment}
        loading={loading}
        onSelect={handleSelect}
        onReassign={handleOpenReassign}
        selectedId={selectedEquipment?.equipment_id}
        sortBy={filters.sort_by}
        sortOrder={filters.sort_order}
        onSort={handleSort}
        visibleColumns={visibleColumns}
        noResultsMessage={
          searchTerm.trim()
            ? `No equipment matches "${searchTerm}"`
            : undefined
        }
        columnWidths={columnWidths}
        onColumnResize={setColumnWidth}
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
