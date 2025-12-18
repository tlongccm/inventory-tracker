/**
 * SoftwarePage - main page combining software list, detail view, and actions.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  Software,
  SoftwareListItem,
  SoftwareFilters,
  SoftwareCreate,
  SoftwareUpdate,
  SoftwareImportResult,
} from '../types/software';
import {
  listSoftware,
  getSoftware,
  createSoftware,
  updateSoftware,
  deleteSoftware,
  exportSoftware,
  importSoftware,
} from '../services/api';
import SoftwareList from '../components/SoftwareList';
import SoftwareDetail from '../components/SoftwareDetail';
import SoftwareForm from '../components/SoftwareForm';
import SoftwareFilterBar from '../components/SoftwareFilterBar';
import SoftwareImportModal from '../components/SoftwareImportModal';
import SearchBox from '../components/SearchBox';
import {
  getSoftwareVisibleColumns,
  SOFTWARE_DEFAULT_COLUMN_WIDTHS,
  SOFTWARE_VIEW_GROUP_KEYS,
  SOFTWARE_VIEW_GROUP_LABELS,
  type SoftwareViewGroupKey,
} from '../utils/softwareColumns';

export default function SoftwarePage() {
  // State
  const [software, setSoftware] = useState<SoftwareListItem[]>([]);
  const [selectedSoftware, setSelectedSoftware] = useState<Software | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SoftwareFilters>({});

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // View preferences state
  const [viewPreferences, setViewPreferences] = useState<Record<SoftwareViewGroupKey, boolean>>({
    license: true,
    purchase: false,
    details: false,
  });

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    SOFTWARE_DEFAULT_COLUMN_WIDTHS
  );

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate visible columns based on preferences
  const visibleColumns = useMemo(
    () => getSoftwareVisibleColumns(viewPreferences),
    [viewPreferences]
  );

  // Load software list
  const loadSoftware = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const searchFilters: SoftwareFilters = {
        ...filters,
        search: searchTerm || undefined,
      };
      const data = await listSoftware(searchFilters);
      setSoftware(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load software');
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  useEffect(() => {
    loadSoftware();
  }, [loadSoftware]);

  // Select software to view details
  const handleSelect = async (softwareId: string) => {
    try {
      setDetailLoading(true);
      const data = await getSoftware(softwareId);
      setSelectedSoftware(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load details');
    } finally {
      setDetailLoading(false);
    }
  };

  // Close detail view
  const handleCloseDetail = () => {
    setSelectedSoftware(null);
  };

  // Open form for adding new software
  const handleAdd = () => {
    setEditMode(false);
    setShowForm(true);
  };

  // Open form for editing selected software
  const handleEdit = () => {
    setEditMode(true);
    setShowForm(true);
  };

  // Save software (create or update)
  const handleSave = async (data: SoftwareCreate | SoftwareUpdate) => {
    try {
      if (editMode && selectedSoftware) {
        await updateSoftware(selectedSoftware.software_id, data as SoftwareUpdate);
        // Refresh details
        const updated = await getSoftware(selectedSoftware.software_id);
        setSelectedSoftware(updated);
      } else {
        await createSoftware(data as SoftwareCreate);
        setSelectedSoftware(null);
      }
      setShowForm(false);
      loadSoftware();
    } catch (err) {
      throw err;
    }
  };

  // Delete software
  const handleDelete = async () => {
    if (!selectedSoftware) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedSoftware.software_id}?`)) {
      return;
    }

    try {
      await deleteSoftware(selectedSoftware.software_id);
      setSelectedSoftware(null);
      loadSoftware();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete software');
    }
  };

  // Export to CSV
  const handleExport = async () => {
    try {
      await exportSoftware();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  // Import from CSV
  const handleImport = async (file: File): Promise<SoftwareImportResult> => {
    const result = await importSoftware(file);
    loadSoftware();
    return result;
  };

  // Handle search term change
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Handle filter change
  const handleFilterChange = (newFilters: SoftwareFilters) => {
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
      sort_by: field as SoftwareFilters['sort_by'],
      sort_order: newOrder,
    });
  };

  // Handle column resize
  const handleColumnResize = (column: string, width: number) => {
    setColumnWidths((prev) => ({
      ...prev,
      [column]: width,
    }));
  };

  // Toggle view group
  const toggleViewGroup = (group: SoftwareViewGroupKey) => {
    setViewPreferences((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  return (
    <div>
      <h1>Software Inventory</h1>

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
            Add Software
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
      <SoftwareFilterBar
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* View Group Toggle */}
      <div className="view-toggle" style={{ marginBottom: 16 }}>
        {SOFTWARE_VIEW_GROUP_KEYS.map((group) => (
          <button
            key={group}
            className={viewPreferences[group] ? 'active' : ''}
            onClick={() => toggleViewGroup(group)}
            style={{
              marginRight: 8,
              padding: '6px 12px',
              backgroundColor: viewPreferences[group] ? '#1976d2' : '#e0e0e0',
              color: viewPreferences[group] ? 'white' : 'black',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {SOFTWARE_VIEW_GROUP_LABELS[group]}
          </button>
        ))}
      </div>

      {/* Search Box */}
      <SearchBox
        value={searchTerm}
        onChange={handleSearchChange}
        isRegex={false}
        onRegexToggle={() => {}}
        error={null}
      />

      {/* Software List */}
      <SoftwareList
        software={software}
        loading={loading}
        onSelect={handleSelect}
        selectedId={selectedSoftware?.software_id}
        sortBy={filters.sort_by}
        sortOrder={filters.sort_order}
        onSort={handleSort}
        visibleColumns={visibleColumns}
        noResultsMessage={
          searchTerm.trim()
            ? `No software matches "${searchTerm}"`
            : undefined
        }
        columnWidths={columnWidths}
        onColumnResize={handleColumnResize}
      />

      {/* Detail Modal */}
      {selectedSoftware && !showForm && (
        <SoftwareDetail
          software={selectedSoftware}
          loading={detailLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={handleCloseDetail}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <SoftwareForm
          software={editMode ? selectedSoftware : null}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Import Modal */}
      {showImport && (
        <SoftwareImportModal
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
