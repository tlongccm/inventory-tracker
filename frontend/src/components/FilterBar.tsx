/**
 * FilterBar component - filter dropdowns and inputs for equipment list.
 */

import type { EquipmentFilters, EquipmentType, Status, UsageType } from '../types/equipment';

interface FilterBarProps {
  filters: EquipmentFilters;
  onChange: (filters: EquipmentFilters) => void;
  onClear: () => void;
}

const EQUIPMENT_TYPES: EquipmentType[] = ['PC', 'Monitor', 'Scanner', 'Printer'];
const STATUSES: Status[] = ['Active', 'Inactive', 'Decommissioned', 'In Repair', 'In Storage'];
const USAGE_TYPES: UsageType[] = ['Personal', 'Work'];

export default function FilterBar({ filters, onChange, onClear }: FilterBarProps) {
  const handleChange = (field: keyof EquipmentFilters, value: string) => {
    onChange({
      ...filters,
      [field]: value || undefined,
    });
  };

  const hasFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

  return (
    <div className="filter-bar">
      <select
        value={filters.equipment_type || ''}
        onChange={(e) => handleChange('equipment_type', e.target.value)}
      >
        <option value="">All Types</option>
        {EQUIPMENT_TYPES.map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>

      <select
        value={filters.status || ''}
        onChange={(e) => handleChange('status', e.target.value)}
      >
        <option value="">All Statuses</option>
        {STATUSES.map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>

      <select
        value={filters.usage_type || ''}
        onChange={(e) => handleChange('usage_type', e.target.value)}
      >
        <option value="">All Usage Types</option>
        {USAGE_TYPES.map((ut) => (
          <option key={ut} value={ut}>{ut}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Filter by location..."
        value={filters.location || ''}
        onChange={(e) => handleChange('location', e.target.value)}
      />

      <input
        type="text"
        placeholder="Filter by user..."
        value={filters.primary_user || ''}
        onChange={(e) => handleChange('primary_user', e.target.value)}
      />

      <input
        type="text"
        placeholder="Filter by model..."
        value={filters.model || ''}
        onChange={(e) => handleChange('model', e.target.value)}
      />

      {hasFilters && (
        <button onClick={onClear} className="secondary">
          Clear Filters
        </button>
      )}
    </div>
  );
}
