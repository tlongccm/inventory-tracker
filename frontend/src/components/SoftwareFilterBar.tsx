/**
 * SoftwareFilterBar component - filter dropdowns for software list.
 */

import type { SoftwareFilters } from '../types/software';
import {
  SOFTWARE_CATEGORIES,
  SOFTWARE_TYPES,
  SOFTWARE_STATUSES,
} from '../types/software';

interface SoftwareFilterBarProps {
  filters: SoftwareFilters;
  onChange: (filters: SoftwareFilters) => void;
  onClear: () => void;
}

export default function SoftwareFilterBar({
  filters,
  onChange,
  onClear,
}: SoftwareFilterBarProps) {
  const handleChange = (field: keyof SoftwareFilters, value: string) => {
    onChange({
      ...filters,
      [field]: value || undefined,
    });
  };

  const hasFilters = Object.entries(filters).some(
    ([key, v]) => key !== 'sort_by' && key !== 'sort_order' && v !== undefined && v !== ''
  );

  return (
    <div className="filter-bar">
      <select
        value={filters.category || ''}
        onChange={(e) => handleChange('category', e.target.value)}
      >
        <option value="">All Categories</option>
        {SOFTWARE_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <select
        value={filters.status || ''}
        onChange={(e) => handleChange('status', e.target.value)}
      >
        <option value="">All Statuses</option>
        {SOFTWARE_STATUSES.map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>

      <select
        value={filters.type || ''}
        onChange={(e) => handleChange('type', e.target.value)}
      >
        <option value="">All Types</option>
        {SOFTWARE_TYPES.map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Filter by vendor..."
        value={filters.vendor || ''}
        onChange={(e) => handleChange('vendor', e.target.value)}
      />

      <input
        type="text"
        placeholder="Filter by purchaser..."
        value={filters.purchaser || ''}
        onChange={(e) => handleChange('purchaser', e.target.value)}
      />

      {hasFilters && (
        <button onClick={onClear} className="secondary">
          Clear Filters
        </button>
      )}
    </div>
  );
}
