/**
 * SubscriptionFilterBar component - filter controls for subscription list.
 */

import type { SubscriptionFilters, SubscriptionStatus, ValueLevel } from '../types/subscription';
import type { Category } from '../types/category';

interface SubscriptionFilterBarProps {
  filters: SubscriptionFilters;
  categories: Category[];
  owners: string[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onChange: (filters: SubscriptionFilters) => void;
  onClear: () => void;
}

const STATUS_OPTIONS: { value: SubscriptionStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

const VALUE_LEVEL_OPTIONS: { value: ValueLevel | ''; label: string }[] = [
  { value: '', label: 'All Value Levels' },
  { value: 'H', label: 'High (H)' },
  { value: 'M', label: 'Medium (M)' },
  { value: 'L', label: 'Low (L)' },
];

export default function SubscriptionFilterBar({
  filters,
  categories,
  owners,
  searchTerm,
  onSearchChange,
  onChange,
  onClear,
}: SubscriptionFilterBarProps) {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SubscriptionStatus | '';
    onChange({
      ...filters,
      status: value || undefined,
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange({
      ...filters,
      category_id: value ? parseInt(value) : undefined,
      subcategory_id: undefined, // Reset subcategory when category changes
    });
  };

  const handleValueLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ValueLevel | '';
    onChange({
      ...filters,
      value_level: value || undefined,
    });
  };

  const handleOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange({
      ...filters,
      ccm_owner: value || undefined,
    });
  };

  const hasFilters =
    filters.status ||
    filters.category_id ||
    filters.value_level ||
    filters.ccm_owner ||
    searchTerm.trim();

  return (
    <div className="filter-bar">
      {/* Search Box */}
      <div className="filter-group">
        <label htmlFor="search">Search</label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search subscriptions..."
          className="search-input"
        />
      </div>

      {/* Status Filter */}
      <div className="filter-group">
        <label htmlFor="status-filter">Status</label>
        <select
          id="status-filter"
          value={filters.status || ''}
          onChange={handleStatusChange}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      <div className="filter-group">
        <label htmlFor="category-filter">Category</label>
        <select
          id="category-filter"
          value={filters.category_id || ''}
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Value Level Filter */}
      <div className="filter-group">
        <label htmlFor="value-filter">Value Level</label>
        <select
          id="value-filter"
          value={filters.value_level || ''}
          onChange={handleValueLevelChange}
        >
          {VALUE_LEVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* CCM Owner Filter */}
      <div className="filter-group">
        <label htmlFor="owner-filter">CCM Owner</label>
        <select
          id="owner-filter"
          value={filters.ccm_owner || ''}
          onChange={handleOwnerChange}
        >
          <option value="">All Owners</option>
          {owners.map((owner) => (
            <option key={owner} value={owner}>
              {owner}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <button className="clear-filters" onClick={onClear}>
          Clear Filters
        </button>
      )}
    </div>
  );
}
