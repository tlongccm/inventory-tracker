/**
 * SubscriptionsPage - main page for subscription management.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type {
  Subscription,
  SubscriptionListItem,
  SubscriptionFilters,
  SubscriptionCreate,
  SubscriptionUpdate,
  SubscriptionImportResult,
} from '../types/subscription';
import {
  listSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  exportSubscriptions,
  importSubscriptions,
  listSubscriptionOwners,
} from '../services/api';
import { useCategories } from '../contexts/CategoryContext';
import SubscriptionList, { SubscriptionListHandle } from '../components/SubscriptionList';
import SubscriptionDetail from '../components/SubscriptionDetail';
import SubscriptionForm from '../components/SubscriptionForm';
import SubscriptionFilterBar from '../components/SubscriptionFilterBar';
import SubscriptionImportModal from '../components/SubscriptionImportModal';
import ShareLinkButton from '../components/ShareLinkButton';
import SearchBox from '../components/SearchBox';
import { useSearchParams } from 'react-router-dom';
import { parseUrlParams, serializeFilters } from '../utils/urlParams';
import { validateRegex } from '../utils/search';

// Subscription view group configuration
const SUBSCRIPTION_VIEW_GROUP_KEYS = ['ai_tools', 'sa_resources', 'by_distribution', 'by_authentication'] as const;
type SubscriptionViewGroupKey = typeof SUBSCRIPTION_VIEW_GROUP_KEYS[number];
const SUBSCRIPTION_VIEW_GROUP_LABELS: Record<SubscriptionViewGroupKey, string> = {
  ai_tools: 'AI Tools',
  sa_resources: 'SA Resources',
  by_distribution: 'By Distribution',
  by_authentication: 'By Authentication',
};

export default function SubscriptionsPage() {
  // URL params
  const [searchParams, setSearchParams] = useSearchParams();
  // Context
  const { categories, loading: categoriesLoading } = useCategories();

  // State
  const [subscriptions, setSubscriptions] = useState<SubscriptionListItem[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SubscriptionFilters>(() => {
    // Initialize filters from URL params
    const params = parseUrlParams(searchParams);
    const initialFilters: SubscriptionFilters = {};
    if (params.status) initialFilters.status = params.status as SubscriptionFilters['status'];
    if (params.category_id) initialFilters.category_id = params.category_id as number;
    if (params.ccm_owner) initialFilters.ccm_owner = params.ccm_owner as string;
    if (params.value_level) initialFilters.value_level = params.value_level as SubscriptionFilters['value_level'];
    if (params.sort) initialFilters.sort_by = params.sort as string;
    if (params.order) initialFilters.sort_order = params.order as 'asc' | 'desc';
    return initialFilters;
  });
  const [owners, setOwners] = useState<string[]>([]);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Search state with regex support
  const [searchTerm, setSearchTerm] = useState(() => {
    const params = parseUrlParams(searchParams);
    return (params.search as string) || '';
  });
  const [isRegex, setIsRegex] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Grid ref for reset functionality
  const gridRef = useRef<SubscriptionListHandle>(null);
  const [hasGridFilters, setHasGridFilters] = useState(false);
  const [groupsExpanded, setGroupsExpanded] = useState(false);

  // View group preferences (placeholder - will control column visibility in future)
  const [viewPreferences, setViewPreferences] = useState<Record<SubscriptionViewGroupKey, boolean>>({
    ai_tools: false,
    sa_resources: false,
    by_distribution: false,
    by_authentication: false,
  });

  // T007: Derive active view mode from viewPreferences (needed for filtering)
  const activeViewMode = viewPreferences.ai_tools
    ? 'ai_tools'
    : viewPreferences.by_distribution
    ? 'by_distribution'
    : viewPreferences.by_authentication
    ? 'by_authentication'
    : 'default';

  // Filter subscriptions based on search term and view mode (client-side, supports regex)
  const filteredSubscriptions = useMemo(() => {
    // Start with all subscriptions
    let result = subscriptions;

    // For AI Tools view, filter to only "AI Tool" category and Active status
    if (activeViewMode === 'ai_tools') {
      result = result.filter((sub) => sub.category_name === 'AI Tool' && sub.status === 'Active');
    }

    // T008: For By Distribution view, filter to only Active subscriptions
    if (activeViewMode === 'by_distribution') {
      result = result.filter((sub) => sub.status === 'Active');
    }

    // T013: For By Authentication view, filter to only Active subscriptions
    if (activeViewMode === 'by_authentication') {
      result = result.filter((sub) => sub.status === 'Active');
    }

    // Apply search filter
    if (!searchTerm.trim()) {
      setSearchError(null);
      return result;
    }

    if (isRegex) {
      const validation = validateRegex(searchTerm);
      if (!validation.valid) {
        setSearchError(validation.error || 'Invalid regex');
        return result;
      }
      setSearchError(null);
      try {
        const regex = new RegExp(searchTerm, 'i');
        return result.filter((sub) =>
          regex.test(sub.subscription_id) ||
          regex.test(sub.provider) ||
          (sub.category_name && regex.test(sub.category_name)) ||
          (sub.ccm_owner && regex.test(sub.ccm_owner)) ||
          (sub.description_value && regex.test(sub.description_value)) ||
          (sub.subscriber_email && regex.test(sub.subscriber_email))
        );
      } catch {
        return result;
      }
    }

    setSearchError(null);
    const term = searchTerm.toLowerCase();
    return result.filter((sub) =>
      sub.subscription_id.toLowerCase().includes(term) ||
      sub.provider.toLowerCase().includes(term) ||
      (sub.category_name && sub.category_name.toLowerCase().includes(term)) ||
      (sub.ccm_owner && sub.ccm_owner.toLowerCase().includes(term)) ||
      (sub.description_value && sub.description_value.toLowerCase().includes(term)) ||
      (sub.subscriber_email && sub.subscriber_email.toLowerCase().includes(term))
    );
  }, [subscriptions, searchTerm, isRegex, activeViewMode]);

  // Load subscriptions list
  const loadSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listSubscriptions(filters);
      setSubscriptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load owners for filter dropdown
  const loadOwners = useCallback(async () => {
    try {
      const data = await listSubscriptionOwners();
      setOwners(data);
    } catch (err) {
      // Non-critical error, just log it
      console.error('Failed to load owners:', err);
    }
  }, []);

  useEffect(() => {
    loadSubscriptions();
    loadOwners();
  }, [loadSubscriptions, loadOwners]);

  // Sync filters and search to URL
  useEffect(() => {
    const urlParams: Record<string, string | number | undefined> = {};
    if (filters.status) urlParams.status = filters.status;
    if (filters.category_id) urlParams.category_id = filters.category_id;
    if (filters.ccm_owner) urlParams.ccm_owner = filters.ccm_owner;
    if (filters.value_level) urlParams.value_level = filters.value_level;
    if (filters.sort_by) urlParams.sort = filters.sort_by;
    if (filters.sort_order) urlParams.order = filters.sort_order;
    if (searchTerm.trim()) urlParams.search = searchTerm;

    const newParams = serializeFilters(urlParams);
    setSearchParams(newParams, { replace: true });
  }, [filters, searchTerm, setSearchParams]);

  // Select subscription to view details
  const handleSelect = async (subscriptionId: string) => {
    try {
      setDetailLoading(true);
      const data = await getSubscription(subscriptionId);
      setSelectedSubscription(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load details');
    } finally {
      setDetailLoading(false);
    }
  };

  // Close detail view
  const handleCloseDetail = () => {
    setSelectedSubscription(null);
  };

  // Open form for adding new subscription
  const handleAdd = () => {
    setEditMode(false);
    setSelectedSubscription(null);
    setShowForm(true);
  };

  // Open form for editing selected subscription
  const handleEdit = () => {
    setEditMode(true);
    setShowForm(true);
  };

  // Save subscription (create or update)
  const handleSave = async (data: SubscriptionCreate | SubscriptionUpdate) => {
    try {
      if (editMode && selectedSubscription) {
        await updateSubscription(selectedSubscription.subscription_id, data as SubscriptionUpdate);
        // Refresh details
        const updated = await getSubscription(selectedSubscription.subscription_id);
        setSelectedSubscription(updated);
      } else {
        const created = await createSubscription(data as SubscriptionCreate);
        setSelectedSubscription(created);
      }
      setShowForm(false);
      loadSubscriptions();
    } catch (err) {
      throw err;
    }
  };

  // Delete subscription
  const handleDelete = async () => {
    if (!selectedSubscription) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedSubscription.subscription_id}?`)) {
      return;
    }

    try {
      await deleteSubscription(selectedSubscription.subscription_id);
      setSelectedSubscription(null);
      loadSubscriptions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subscription');
    }
  };

  // Export to CSV
  const handleExport = async () => {
    try {
      await exportSubscriptions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  // Import from CSV
  const handleImport = async (file: File): Promise<SubscriptionImportResult> => {
    const result = await importSubscriptions(file);
    loadSubscriptions();
    return result;
  };

  // Filter change
  const handleFilterChange = (newFilters: SubscriptionFilters) => {
    setFilters(newFilters);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({});
  };

  // Handle search change
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchError(null);
    }
  }, []);

  // Handle regex toggle
  const handleRegexToggle = useCallback(() => {
    setIsRegex((prev) => !prev);
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

  // Toggle view group (mutually exclusive - only one can be active at a time)
  const toggleViewGroup = (group: SubscriptionViewGroupKey) => {
    setViewPreferences((prev) => {
      // If clicking the already-active button, deselect it
      if (prev[group]) {
        return {
          ai_tools: false,
          sa_resources: false,
          by_distribution: false,
          by_authentication: false,
        };
      }
      // Otherwise, select only the clicked button
      return {
        ai_tools: group === 'ai_tools',
        sa_resources: group === 'sa_resources',
        by_distribution: group === 'by_distribution',
        by_authentication: group === 'by_authentication',
      };
    });

    // Reset groups expanded state when switching views (groups start collapsed)
    setGroupsExpanded(false);

    // Auto-sort by access_level_required when entering AI Tools view
    if (group === 'ai_tools' && !viewPreferences.ai_tools) {
      setFilters((prev) => ({
        ...prev,
        sort_by: 'access_level_required',
        sort_order: 'asc',
      }));
    }
  };

  // Handle column sort
  const handleSort = (field: string) => {
    const newOrder = filters.sort_by === field && filters.sort_order === 'asc' ? 'desc' : 'asc';
    setFilters({
      ...filters,
      sort_by: field,
      sort_order: newOrder,
    });
  };

  // Reset all filters (page filters, grid filters, search, and sort)
  const handleResetAll = useCallback(() => {
    // Clear page-level filters
    setFilters({});
    // Clear search
    setSearchTerm('');
    setSearchError(null);
    // Reset grid column filters and sort
    gridRef.current?.resetFiltersAndSort();
    setHasGridFilters(false);
    // Reset view preferences
    setViewPreferences({
      ai_tools: false,
      sa_resources: false,
      by_distribution: false,
      by_authentication: false,
    });
  }, []);

  // Handle grid filter changes
  const handleGridFilterChanged = useCallback((hasFilters: boolean) => {
    setHasGridFilters(hasFilters);
  }, []);

  // Toggle expand/collapse all groups in pivot view
  const handleToggleGroups = useCallback(() => {
    if (groupsExpanded) {
      gridRef.current?.collapseAllGroups();
    } else {
      gridRef.current?.expandAllGroups();
    }
    setGroupsExpanded(!groupsExpanded);
  }, [groupsExpanded]);

  // Check if any filters are active (for showing Reset button state)
  const hasAnyFilters = useMemo(() => {
    const hasPageFilters = !!(filters.status || filters.category_id || filters.ccm_owner || filters.value_level);
    const hasSort = !!(filters.sort_by || filters.sort_order);
    const hasSearch = !!searchTerm.trim();
    const hasViewPrefs = Object.values(viewPreferences).some(v => v);
    return hasPageFilters || hasSort || hasSearch || hasGridFilters || hasViewPrefs;
  }, [filters, searchTerm, hasGridFilters, viewPreferences]);

  return (
    <div>
      <h1>Subscriptions</h1>

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
          <button
            className={`secondary ${hasAnyFilters ? 'reset-active' : ''}`}
            onClick={handleResetAll}
            disabled={!hasAnyFilters}
            title="Reset all filters, sorting, and search"
          >
            Reset
          </button>
          <ShareLinkButton />
        </div>
      </div>

      {/* Filter Bar */}
      <SubscriptionFilterBar
        filters={filters}
        categories={categories}
        owners={owners}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Search Box */}
      <SearchBox
        value={searchTerm}
        onChange={handleSearchChange}
        isRegex={isRegex}
        onRegexToggle={handleRegexToggle}
        error={searchError}
      />

      {/* View Group Toggle */}
      <div className="view-group-toggle">
        {SUBSCRIPTION_VIEW_GROUP_KEYS.map((group) => (
          <button
            key={group}
            className={`toggle-chip ${viewPreferences[group] ? 'active' : ''}`}
            onClick={() => toggleViewGroup(group)}
            type="button"
          >
            {SUBSCRIPTION_VIEW_GROUP_LABELS[group]}
          </button>
        ))}
        {activeViewMode !== 'default' && (
          <button
            className={`toggle-chip ${groupsExpanded ? 'active' : ''}`}
            onClick={handleToggleGroups}
            type="button"
          >
            {groupsExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        )}
      </div>

      {/* Subscription List */}
      <SubscriptionList
        ref={gridRef}
        subscriptions={filteredSubscriptions}
        loading={loading || categoriesLoading}
        onSelect={handleSelect}
        selectedId={selectedSubscription?.subscription_id}
        sortBy={filters.sort_by}
        sortOrder={filters.sort_order}
        onSort={handleSort}
        onFilterChanged={handleGridFilterChanged}
        noResultsMessage={
          searchTerm.trim()
            ? `No subscriptions match "${searchTerm}"`
            : undefined
        }
        viewMode={activeViewMode}
      />

      {/* Detail Modal */}
      {selectedSubscription && !showForm && (
        <SubscriptionDetail
          subscription={selectedSubscription}
          loading={detailLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={handleCloseDetail}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <SubscriptionForm
          subscription={editMode ? selectedSubscription : null}
          categories={categories}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Import Modal */}
      {showImport && (
        <SubscriptionImportModal
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
