/**
 * SubscriptionList component - displays subscriptions in a table.
 */

import type { SubscriptionListItem, RenewalStatus } from '../types/subscription';

interface SubscriptionListProps {
  subscriptions: SubscriptionListItem[];
  loading: boolean;
  onSelect: (subscriptionId: string) => void;
  selectedId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  noResultsMessage?: string;
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'Active':
      return 'status-active';
    case 'Inactive':
      return 'status-inactive';
    default:
      return '';
  }
}

function getRenewalStatusClass(renewalStatus: RenewalStatus | null): string {
  switch (renewalStatus) {
    case 'overdue':
      return 'renewal-overdue';
    case 'urgent':
      return 'renewal-urgent';
    case 'warning':
      return 'renewal-warning';
    case 'ok':
      return 'renewal-ok';
    default:
      return '';
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
}

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

// Always visible columns
const ALWAYS_VISIBLE_COLUMNS = [
  { key: 'subscription_id', label: 'ID', sortable: true, width: 100 },
  { key: 'provider', label: 'Provider', sortable: true, width: 200 },
  { key: 'category_name', label: 'Category', sortable: true, width: 180 },
  { key: 'status', label: 'Status', sortable: true, width: 90 },
  { key: 'ccm_owner', label: 'CCM Owner', sortable: true, width: 130 },
];

export default function SubscriptionList({
  subscriptions,
  loading,
  onSelect,
  selectedId,
  sortBy,
  sortOrder,
  onSort,
  noResultsMessage,
}: SubscriptionListProps) {
  if (loading) {
    return <div className="loading">Loading subscriptions...</div>;
  }

  if (subscriptions.length === 0) {
    if (noResultsMessage) {
      return (
        <div className="no-results">
          <h3>No results found</h3>
          <p>{noResultsMessage}</p>
        </div>
      );
    }
    return (
      <div className="empty-state">
        <h3>No subscriptions found</h3>
        <p>No subscriptions are currently tracked.</p>
        <p>Click "Add Subscription" to add the first record.</p>
      </div>
    );
  }

  const renderHeader = (field: string, label: string, sortable: boolean, width: number) => {
    const isActive = sortBy === field;
    const indicator = isActive
      ? sortOrder === 'asc'
        ? ' ▲'
        : ' ▼'
      : sortable
        ? ' ⇅'
        : '';

    return (
      <th
        key={field}
        onClick={() => sortable && onSort?.(field)}
        className={sortable ? 'sortable' : ''}
        style={{ width: `${width}px`, cursor: sortable ? 'pointer' : 'default' }}
      >
        {label}
        {indicator && (
          <span className={`sort-indicator ${isActive ? 'active' : ''}`}>
            {indicator}
          </span>
        )}
      </th>
    );
  };

  return (
    <div className="table-container">
      <table className="subscription-table">
        <thead>
          <tr>
            {ALWAYS_VISIBLE_COLUMNS.map((col) =>
              renderHeader(col.key, col.label, col.sortable, col.width)
            )}
            <th style={{ width: '100px' }}>Renewal</th>
            <th style={{ width: '110px' }}>Annual Cost</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => (
            <tr
              key={sub.subscription_id}
              onClick={() => onSelect(sub.subscription_id)}
              className={`${selectedId === sub.subscription_id ? 'selected' : ''} ${getRenewalStatusClass(sub.renewal_status)}`}
              style={{ cursor: 'pointer' }}
            >
              <td>{sub.subscription_id}</td>
              <td>{sub.provider}</td>
              <td>{sub.category_name || '-'}</td>
              <td>
                <span className={`status-badge ${getStatusClass(sub.status)}`}>
                  {sub.status}
                </span>
              </td>
              <td>{sub.ccm_owner || '-'}</td>
              <td>{formatDate(sub.renewal_date)}</td>
              <td>{formatCurrency(sub.annual_cost)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
