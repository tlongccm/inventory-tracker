/**
 * SubscriptionDetail component - displays full subscription details in a modal.
 */

import { useState } from 'react';
import type { Subscription } from '../types/subscription';
import MarkdownRenderer from './MarkdownRenderer';

interface SubscriptionDetailProps {
  subscription: Subscription;
  loading: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
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

function formatBoolean(value: boolean | null): string {
  if (value === null || value === undefined) return '-';
  return value ? 'Yes' : 'No';
}

export default function SubscriptionDetail({
  subscription,
  loading,
  onEdit,
  onDelete,
  onClose,
}: SubscriptionDetailProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  const DetailRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || '-'}</span>
    </div>
  );

  const LinkRow = ({ label, url }: { label: string; url: string | null }) => (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
        ) : (
          '-'
        )}
      </span>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{subscription.subscription_id} - {subscription.provider}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Core Information */}
          <section className="detail-section">
            <h3>Core Information</h3>
            <DetailRow label="Subscription ID" value={subscription.subscription_id} />
            <DetailRow label="Provider" value={subscription.provider} />
            <DetailRow label="Category" value={subscription.category_name} />
            <DetailRow label="Subcategory" value={subscription.subcategory_name} />
            <DetailRow label="Status" value={subscription.status} />
            <DetailRow label="CCM Owner" value={subscription.ccm_owner} />
            <DetailRow label="Value Level" value={subscription.value_level} />
          </section>

          {/* Access Information */}
          <section className="detail-section">
            <h3>Access Information</h3>
            <LinkRow label="Link" url={subscription.link} />
            <DetailRow label="Authentication" value={subscription.authentication} />
            <DetailRow label="Username" value={subscription.username} />
            <div className="detail-row">
              <span className="detail-label">Password</span>
              <span className="detail-value">
                {subscription.password ? (
                  <>
                    {showPassword ? subscription.password : '••••••••'}
                    <button
                      type="button"
                      className="small-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ marginLeft: 8 }}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </>
                ) : (
                  '-'
                )}
              </span>
            </div>
            <DetailRow label="In Lastpass?" value={formatBoolean(subscription.in_lastpass)} />
            <DetailRow label="Access Level Required" value={subscription.access_level_required} />
          </section>

          {/* Financial Information */}
          <section className="detail-section">
            <h3>Financial Information</h3>
            <DetailRow label="Payment Method" value={subscription.payment_method} />
            <DetailRow label="Cost" value={subscription.cost} />
            <DetailRow label="Annual Cost" value={formatCurrency(subscription.annual_cost)} />
            <DetailRow label="Payment Frequency" value={subscription.payment_frequency} />
            <DetailRow label="Renewal Date" value={formatDate(subscription.renewal_date)} />
          </section>

          {/* Communication */}
          <section className="detail-section">
            <h3>Communication</h3>
            <DetailRow label="Subscriber Email" value={subscription.subscriber_email} />
            <DetailRow label="Forward To" value={subscription.forward_to} />
            <DetailRow label="Email Routing" value={subscription.email_routing} />
            <DetailRow label="Email Volume/Week" value={subscription.email_volume_per_week} />
            <DetailRow label="Main Vendor Contact" value={subscription.main_vendor_contact} />
          </section>

          {/* Details */}
          <section className="detail-section">
            <h3>Details</h3>
            <div className="detail-row">
              <span className="detail-label">Description & Value</span>
              <span className="detail-value multiline">
                {subscription.description_value ? (
                  <MarkdownRenderer content={subscription.description_value} />
                ) : (
                  '-'
                )}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Subscription Log</span>
              <span className="detail-value multiline">
                {subscription.subscription_log ? (
                  <MarkdownRenderer content={subscription.subscription_log} />
                ) : (
                  '-'
                )}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Actions/To Do</span>
              <span className="detail-value multiline">
                {subscription.actions_todos ? (
                  <MarkdownRenderer content={subscription.actions_todos} />
                ) : (
                  '-'
                )}
              </span>
            </div>
            <DetailRow label="Last Confirmed Alive" value={formatDate(subscription.last_confirmed_alive)} />
          </section>

          {/* Metadata */}
          <section className="detail-section metadata">
            <h3>Metadata</h3>
            <DetailRow label="Created" value={formatDate(subscription.created_at)} />
            <DetailRow label="Last Updated" value={formatDate(subscription.updated_at)} />
            {subscription.is_deleted && (
              <DetailRow label="Deleted" value={formatDate(subscription.deleted_at)} />
            )}
          </section>
        </div>

        <div className="modal-footer">
          <button className="primary" onClick={onEdit}>
            Edit
          </button>
          <button className="danger" onClick={onDelete}>
            Delete
          </button>
          <button className="secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
