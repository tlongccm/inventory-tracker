/**
 * SubscriptionForm component - form for creating/editing subscriptions.
 */

import { useState, useEffect, useMemo } from 'react';
import type {
  Subscription,
  SubscriptionCreate,
  SubscriptionUpdate,
  SubscriptionStatus,
  ValueLevel,
  PaymentFrequency,
} from '../types/subscription';
import type { Category, Subcategory } from '../types/category';

interface SubscriptionFormProps {
  subscription: Subscription | null;
  categories: Category[];
  onSave: (data: SubscriptionCreate | SubscriptionUpdate) => Promise<void>;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: SubscriptionStatus; label: string }[] = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

const VALUE_LEVEL_OPTIONS: { value: ValueLevel | ''; label: string }[] = [
  { value: '', label: '-- Select --' },
  { value: 'H', label: 'High (H)' },
  { value: 'M', label: 'Medium (M)' },
  { value: 'L', label: 'Low (L)' },
];

const PAYMENT_FREQUENCY_OPTIONS: { value: PaymentFrequency | ''; label: string }[] = [
  { value: '', label: '-- Select --' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Annual', label: 'Annual' },
  { value: 'Other', label: 'Other' },
];

export default function SubscriptionForm({
  subscription,
  categories,
  onSave,
  onClose,
}: SubscriptionFormProps) {
  const isEdit = !!subscription;

  // Form state
  const [formData, setFormData] = useState({
    provider: subscription?.provider || '',
    category_id: subscription?.category_id?.toString() || '',
    subcategory_id: subscription?.subcategory_id?.toString() || '',
    link: subscription?.link || '',
    authentication: subscription?.authentication || '',
    username: subscription?.username || '',
    password: subscription?.password || '',
    in_lastpass: subscription?.in_lastpass?.toString() || '',
    status: subscription?.status || 'Active',
    description_value: subscription?.description_value || '',
    value_level: subscription?.value_level || '',
    ccm_owner: subscription?.ccm_owner || '',
    subscription_log: subscription?.subscription_log || '',
    payment_method: subscription?.payment_method || '',
    cost: subscription?.cost || '',
    annual_cost: subscription?.annual_cost?.toString() || '',
    payment_frequency: subscription?.payment_frequency || '',
    renewal_date: subscription?.renewal_date || '',
    last_confirmed_alive: subscription?.last_confirmed_alive || '',
    main_vendor_contact: subscription?.main_vendor_contact || '',
    subscriber_email: subscription?.subscriber_email || '',
    forward_to: subscription?.forward_to || '',
    email_routing: subscription?.email_routing || '',
    email_volume_per_week: subscription?.email_volume_per_week || '',
    actions_todos: subscription?.actions_todos || '',
    access_level_required: subscription?.access_level_required || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Get subcategories for selected category
  const subcategories = useMemo<Subcategory[]>(() => {
    if (!formData.category_id) return [];
    const category = categories.find((c) => c.id.toString() === formData.category_id);
    return category?.subcategories.filter((s) => s.is_active) || [];
  }, [categories, formData.category_id]);

  // Reset subcategory when category changes
  useEffect(() => {
    if (!formData.category_id) {
      setFormData((prev) => ({ ...prev, subcategory_id: '' }));
    } else {
      // Check if current subcategory is valid for new category
      const validSubcategory = subcategories.find(
        (s) => s.id.toString() === formData.subcategory_id
      );
      if (!validSubcategory) {
        setFormData((prev) => ({ ...prev, subcategory_id: '' }));
      }
    }
  }, [formData.category_id, subcategories, formData.subcategory_id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.provider.trim()) {
      setError('Provider is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Build the data object
      const data: SubscriptionCreate | SubscriptionUpdate = {
        provider: formData.provider.trim(),
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id) : null,
        link: formData.link.trim() || null,
        authentication: formData.authentication.trim() || null,
        username: formData.username.trim() || null,
        password: formData.password || null,
        in_lastpass: formData.in_lastpass === 'true' ? true : formData.in_lastpass === 'false' ? false : null,
        status: formData.status as SubscriptionStatus,
        description_value: formData.description_value.trim() || null,
        value_level: (formData.value_level as ValueLevel) || null,
        ccm_owner: formData.ccm_owner.trim() || null,
        subscription_log: formData.subscription_log.trim() || null,
        payment_method: formData.payment_method.trim() || null,
        cost: formData.cost.trim() || null,
        annual_cost: formData.annual_cost ? parseFloat(formData.annual_cost) : null,
        payment_frequency: (formData.payment_frequency as PaymentFrequency) || null,
        renewal_date: formData.renewal_date || null,
        last_confirmed_alive: formData.last_confirmed_alive || null,
        main_vendor_contact: formData.main_vendor_contact.trim() || null,
        subscriber_email: formData.subscriber_email.trim() || null,
        forward_to: formData.forward_to.trim() || null,
        email_routing: formData.email_routing.trim() || null,
        email_volume_per_week: formData.email_volume_per_week.trim() || null,
        actions_todos: formData.actions_todos.trim() || null,
        access_level_required: formData.access_level_required.trim() || null,
      };

      await onSave(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save subscription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Subscription' : 'Add Subscription'}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error">{error}</div>}

            {/* Core Information */}
            <section className="form-section">
              <h3>Core Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="provider">Provider *</label>
                  <input
                    type="text"
                    id="provider"
                    name="provider"
                    value={formData.provider}
                    onChange={handleChange}
                    required
                    maxLength={200}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category_id">Category</label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="subcategory_id">Sector / Subject</label>
                  <select
                    id="subcategory_id"
                    name="subcategory_id"
                    value={formData.subcategory_id}
                    onChange={handleChange}
                    disabled={!formData.category_id}
                  >
                    <option value="">-- Select Sector / Subject --</option>
                    {subcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ccm_owner">CCM Owner</label>
                  <input
                    type="text"
                    id="ccm_owner"
                    name="ccm_owner"
                    value={formData.ccm_owner}
                    onChange={handleChange}
                    maxLength={200}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="value_level">Value Level</label>
                  <select
                    id="value_level"
                    name="value_level"
                    value={formData.value_level}
                    onChange={handleChange}
                  >
                    {VALUE_LEVEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Access Information */}
            <section className="form-section">
              <h3>Access Information</h3>
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="link">Link (URL)</label>
                  <input
                    type="url"
                    id="link"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    maxLength={500}
                    placeholder="https://"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="authentication">Authentication</label>
                  <input
                    type="text"
                    id="authentication"
                    name="authentication"
                    value={formData.authentication}
                    onChange={handleChange}
                    maxLength={200}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    maxLength={200}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      maxLength={500}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="in_lastpass">In Lastpass?</label>
                  <select
                    id="in_lastpass"
                    name="in_lastpass"
                    value={formData.in_lastpass}
                    onChange={handleChange}
                  >
                    <option value="">-- Select --</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="access_level_required">Access Level Required</label>
                  <input
                    type="text"
                    id="access_level_required"
                    name="access_level_required"
                    value={formData.access_level_required}
                    onChange={handleChange}
                    maxLength={200}
                  />
                </div>
              </div>
            </section>

            {/* Financial Information */}
            <section className="form-section">
              <h3>Financial Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="payment_method">Payment Method</label>
                  <input
                    type="text"
                    id="payment_method"
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    maxLength={200}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="payment_frequency">Payment Frequency</label>
                  <select
                    id="payment_frequency"
                    name="payment_frequency"
                    value={formData.payment_frequency}
                    onChange={handleChange}
                  >
                    {PAYMENT_FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cost">Cost (Description)</label>
                  <input
                    type="text"
                    id="cost"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    maxLength={100}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="annual_cost">Annual Cost ($)</label>
                  <input
                    type="number"
                    id="annual_cost"
                    name="annual_cost"
                    value={formData.annual_cost}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="renewal_date">Renewal Date</label>
                  <input
                    type="date"
                    id="renewal_date"
                    name="renewal_date"
                    value={formData.renewal_date}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            {/* Communication */}
            <section className="form-section">
              <h3>Communication</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="subscriber_email">Subscriber Email</label>
                  <input
                    type="email"
                    id="subscriber_email"
                    name="subscriber_email"
                    value={formData.subscriber_email}
                    onChange={handleChange}
                    maxLength={200}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="forward_to">Forward To</label>
                  <input
                    type="email"
                    id="forward_to"
                    name="forward_to"
                    value={formData.forward_to}
                    onChange={handleChange}
                    maxLength={200}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email_routing">Email Routing</label>
                  <input
                    type="text"
                    id="email_routing"
                    name="email_routing"
                    value={formData.email_routing}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="Inbox / News / Archive"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email_volume_per_week">Email Volume/Week</label>
                  <input
                    type="text"
                    id="email_volume_per_week"
                    name="email_volume_per_week"
                    value={formData.email_volume_per_week}
                    onChange={handleChange}
                    maxLength={100}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="main_vendor_contact">Main Vendor Contact</label>
                  <input
                    type="text"
                    id="main_vendor_contact"
                    name="main_vendor_contact"
                    value={formData.main_vendor_contact}
                    onChange={handleChange}
                    maxLength={500}
                  />
                </div>
              </div>
            </section>

            {/* Details */}
            <section className="form-section">
              <h3>Details</h3>
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="description_value">Description & Value to CCM</label>
                  <textarea
                    id="description_value"
                    name="description_value"
                    value={formData.description_value}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="subscription_log">Subscription Log & Workflow</label>
                  <textarea
                    id="subscription_log"
                    name="subscription_log"
                    value={formData.subscription_log}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="actions_todos">Actions/To Do</label>
                  <textarea
                    id="actions_todos"
                    name="actions_todos"
                    value={formData.actions_todos}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="last_confirmed_alive">Last Confirmed Alive</label>
                  <input
                    type="date"
                    id="last_confirmed_alive"
                    name="last_confirmed_alive"
                    value={formData.last_confirmed_alive}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="modal-footer">
            <button type="submit" className="primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Subscription'}
            </button>
            <button type="button" className="secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
