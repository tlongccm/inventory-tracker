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

// Column definition type
interface ColumnDef {
  key: string;
  label: string;
  sortable: boolean;
  width: number;
  align?: 'left' | 'right' | 'center';
}

// All columns for the subscription table (headers match legacy CSV)
const ALL_COLUMNS: ColumnDef[] = [
  // Core identification
  { key: 'subscription_id', label: 'ID', sortable: true, width: 90 },
  { key: 'provider', label: 'Provider', sortable: true, width: 180 },
  { key: 'category_name', label: 'Category', sortable: true, width: 140 },
  { key: 'subcategory_name', label: 'Sector / Subject', sortable: true, width: 120 },
  { key: 'link', label: 'URL', sortable: false, width: 180 },
  { key: 'username', label: 'Username', sortable: false, width: 150 },
  { key: 'password', label: 'Password', sortable: false, width: 120 },
  { key: 'in_lastpass', label: 'In LastPass', sortable: false, width: 80 },
  { key: 'authentication', label: 'Auth Method', sortable: false, width: 120 },
  { key: 'status', label: 'Status', sortable: true, width: 80 },
  { key: 'description_value', label: 'Description & Value to CCM', sortable: false, width: 200 },
  { key: 'value_level', label: 'Value', sortable: true, width: 60 },
  { key: 'ccm_owner', label: 'CCM Owner', sortable: true, width: 100 },
  { key: 'subscription_log', label: 'Subscription Log', sortable: false, width: 150 },
  { key: 'payment_method', label: 'Payment Method', sortable: false, width: 130 },
  { key: 'cost', label: 'Payment Amount', sortable: false, width: 110, align: 'right' },
  { key: 'payment_frequency', label: 'Payment Frequency', sortable: false, width: 120 },
  { key: 'annual_cost', label: 'Annual Cost', sortable: true, width: 100, align: 'right' },
  { key: 'renewal_date', label: 'Renewal Date', sortable: true, width: 100 },
  { key: 'last_confirmed_alive', label: 'Last confirmed alive', sortable: true, width: 130 },
  { key: 'main_vendor_contact', label: 'Main contact', sortable: false, width: 150 },
  { key: 'subscriber_email', label: 'Destination email', sortable: false, width: 160 },
  { key: 'forward_to', label: 'Forward to', sortable: false, width: 140 },
  { key: 'email_routing', label: 'RR email routing', sortable: false, width: 120 },
  { key: 'email_volume_per_week', label: 'Email volume / week', sortable: false, width: 120 },
  { key: 'notes', label: 'Notes', sortable: false, width: 150 },
  { key: 'actions_todos', label: 'Actions', sortable: false, width: 150 },
  { key: 'access_level_required', label: 'Access Level Required', sortable: false, width: 140 },
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

  const renderHeader = (col: ColumnDef) => {
    const isActive = sortBy === col.key;
    const indicator = isActive
      ? sortOrder === 'asc'
        ? '▲'
        : '▼'
      : col.sortable
        ? '⇅'
        : null;

    return (
      <th
        key={col.key}
        onClick={() => col.sortable && onSort?.(col.key)}
        className={col.sortable ? 'sortable' : ''}
        data-column={col.key}
        style={{
          width: `${col.width}px`,
          minWidth: `${col.width}px`,
          maxWidth: `${col.width}px`,
          textAlign: col.align || 'left'
        }}
      >
        <div className="th-content" style={{ justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start' }}>
          {col.label}
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
  const totalTableWidth = ALL_COLUMNS.reduce((sum, col) => sum + col.width, 0);

  // Render clickable URL cell
  const renderUrlCell = (url: string | null) => {
    if (!url) return '-';
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="clickable-url"
        onClick={(e) => e.stopPropagation()}
        title={url}
      >
        {url.length > 30 ? `${url.substring(0, 30)}...` : url}
      </a>
    );
  };

  // Render cell value based on column type
  const renderCellValue = (sub: SubscriptionListItem, colKey: string) => {
    const value = sub[colKey as keyof SubscriptionListItem];

    // Special rendering for specific columns
    switch (colKey) {
      case 'status':
        return (
          <span className={`status-badge ${getStatusClass(sub.status)}`}>
            {sub.status}
          </span>
        );
      case 'link':
        return renderUrlCell(sub.link);
      case 'renewal_date':
      case 'last_confirmed_alive':
        return formatDate(value as string | null);
      case 'cost':
      case 'annual_cost':
        return formatCurrency(value as number | null);
      case 'in_lastpass':
        return value === true ? 'Yes' : value === false ? 'No' : '-';
      case 'description_value':
      case 'subscription_log':
      case 'actions_todos':
      case 'main_vendor_contact':
      case 'notes':
        // Truncate long text fields
        if (typeof value === 'string' && value.length > 50) {
          return <span title={value}>{value.substring(0, 50)}...</span>;
        }
        return value || '-';
      default:
        return value ?? '-';
    }
  };

  return (
    <div className="table-wrapper">
      <table className="resizable-table" style={{ width: `${totalTableWidth}px`, minWidth: `${totalTableWidth}px` }}>
        <thead>
          <tr>
            {ALL_COLUMNS.map((col) => renderHeader(col))}
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
              {ALL_COLUMNS.map((col) => (
                <td
                  key={col.key}
                  data-column={col.key}
                  style={{
                    width: `${col.width}px`,
                    minWidth: `${col.width}px`,
                    maxWidth: `${col.width}px`,
                    textAlign: col.align || 'left'
                  }}
                >
                  {renderCellValue(sub, col.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
