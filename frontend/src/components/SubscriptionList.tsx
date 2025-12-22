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
        ? '▲'
        : '▼'
      : sortable
        ? '⇅'
        : null;

    return (
      <th
        key={field}
        onClick={() => sortable && onSort?.(field)}
        className={sortable ? 'sortable' : ''}
        data-column={field}
        style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
      >
        <div className="th-content">
          {label}
          {indicator && (
            <span className={`sort-indicator ${isActive ? 'active' : ''}`}>
              {indicator}
            </span>
          )}
        </div>
      </th>
    );
  };

  // Calculate total table width from column widths
  const totalTableWidth = ALWAYS_VISIBLE_COLUMNS.reduce(
    (sum, col) => sum + col.width,
    100 + 110 // Add Renewal (100px) + Annual Cost (110px)
  );

  return (
    <div className="table-wrapper">
      <table className="resizable-table" style={{ width: `${totalTableWidth}px`, maxWidth: `${totalTableWidth}px` }}>
        <thead>
          <tr>
            {ALWAYS_VISIBLE_COLUMNS.map((col) =>
              renderHeader(col.key, col.label, col.sortable, col.width)
            )}
            <th data-column="renewal_date" style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }}>
              <div className="th-content">Renewal</div>
            </th>
            <th data-column="annual_cost" style={{ width: '110px', minWidth: '110px', maxWidth: '110px' }}>
              <div className="th-content">Annual Cost</div>
            </th>
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
              <td data-column="subscription_id" style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }}>{sub.subscription_id}</td>
              <td data-column="provider" style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>{sub.provider}</td>
              <td data-column="category_name" style={{ width: '180px', minWidth: '180px', maxWidth: '180px' }}>{sub.category_name || '-'}</td>
              <td data-column="status" style={{ width: '90px', minWidth: '90px', maxWidth: '90px' }}>
                <span className={`status-badge ${getStatusClass(sub.status)}`}>
                  {sub.status}
                </span>
              </td>
              <td data-column="ccm_owner" style={{ width: '130px', minWidth: '130px', maxWidth: '130px' }}>{sub.ccm_owner || '-'}</td>
              <td data-column="renewal_date" style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }}>{formatDate(sub.renewal_date)}</td>
              <td data-column="annual_cost" style={{ width: '110px', minWidth: '110px', maxWidth: '110px' }}>{formatCurrency(sub.annual_cost)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
