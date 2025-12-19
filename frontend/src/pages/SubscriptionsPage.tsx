/**
 * SubscriptionsPage - main page for subscription management.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import SubscriptionList from '../components/SubscriptionList';
import SubscriptionDetail from '../components/SubscriptionDetail';
import SubscriptionForm from '../components/SubscriptionForm';
import SubscriptionFilterBar from '../components/SubscriptionFilterBar';
import SubscriptionImportModal from '../components/SubscriptionImportModal';

export default function SubscriptionsPage() {
  // Context
  const { categories, loading: categoriesLoading } = useCategories();

  // State
  const [subscriptions, setSubscriptions] = useState<SubscriptionListItem[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SubscriptionFilters>({});
  const [owners, setOwners] = useState<string[]>([]);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Filter subscriptions based on search term (client-side)
  const filteredSubscriptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return subscriptions;
    }
    const term = searchTerm.toLowerCase();
    return subscriptions.filter((sub) =>
      sub.subscription_id.toLowerCase().includes(term) ||
      sub.provider.toLowerCase().includes(term) ||
      (sub.category_name && sub.category_name.toLowerCase().includes(term)) ||
      (sub.ccm_owner && sub.ccm_owner.toLowerCase().includes(term)) ||
      (sub.description_value && sub.description_value.toLowerCase().includes(term)) ||
      (sub.subscriber_email && sub.subscriber_email.toLowerCase().includes(term))
    );
  }, [subscriptions, searchTerm]);

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
    setSearchTerm('');
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
            Add Subscription
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
      <SubscriptionFilterBar
        filters={filters}
        categories={categories}
        owners={owners}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Subscription List */}
      <SubscriptionList
        subscriptions={filteredSubscriptions}
        loading={loading || categoriesLoading}
        onSelect={handleSelect}
        selectedId={selectedSubscription?.subscription_id}
        sortBy={filters.sort_by}
        sortOrder={filters.sort_order}
        onSort={handleSort}
        noResultsMessage={
          searchTerm.trim()
            ? `No subscriptions match "${searchTerm}"`
            : undefined
        }
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
