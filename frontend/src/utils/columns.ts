// Column visibility utility functions
import type { ViewPreferences } from '../types/viewGroups';
import type { ColumnDefinition } from '../config/columns';
import {
  ALWAYS_VISIBLE_COLUMNS,
  STATUS_COLUMN,
  VIEW_GROUP_COLUMNS,
  VIEW_GROUP_KEYS,
} from '../config/columns';

/**
 * Returns the list of visible columns based on active view groups.
 * Always includes: Equipment ID, Subcategory, User, Name
 * Optionally includes: view group columns based on preferences
 * Always last: Status column
 *
 * Special handling: Category column appears after Equipment ID (before Subcategory)
 * when Summary view is enabled.
 *
 * Deduplicates columns by key to avoid duplicates when multiple views share columns.
 */
export function getVisibleColumns(preferences: ViewPreferences): ColumnDefinition[] {
  const columns: ColumnDefinition[] = [];
  const addedKeys = new Set<string>();

  // Helper to add column if not already added
  const addColumn = (col: ColumnDefinition) => {
    if (!addedKeys.has(col.key)) {
      columns.push(col);
      addedKeys.add(col.key);
    }
  };

  // Equipment ID is always first
  const equipmentIdCol = ALWAYS_VISIBLE_COLUMNS.find(col => col.key === 'equipment_id');
  if (equipmentIdCol) {
    addColumn(equipmentIdCol);
  }

  // If Summary view is enabled, insert Category right after Equipment ID
  if (preferences.summary) {
    const categoryCol = VIEW_GROUP_COLUMNS.summary.find(col => col.key === 'equipment_type');
    if (categoryCol) {
      addColumn(categoryCol);
    }
  }

  // Add remaining always-visible columns (Subcategory, User, Name)
  for (const col of ALWAYS_VISIBLE_COLUMNS) {
    if (col.key !== 'equipment_id') {
      addColumn(col);
    }
  }

  // Add columns from active view groups in defined order
  for (const group of VIEW_GROUP_KEYS) {
    if (preferences[group] && group !== 'full') {
      // Filter out Category from Summary since it's already added above
      const groupColumns = group === 'summary'
        ? VIEW_GROUP_COLUMNS[group].filter(col => col.key !== 'equipment_type')
        : VIEW_GROUP_COLUMNS[group];
      for (const col of groupColumns) {
        addColumn(col);
      }
    }
  }

  // Status column is always last
  addColumn(STATUS_COLUMN);

  return columns;
}

/**
 * Returns all column keys from active view groups (for data access).
 */
export function getVisibleColumnKeys(preferences: ViewPreferences): string[] {
  return getVisibleColumns(preferences).map((col) => col.key);
}

/**
 * Checks if a column key is currently visible.
 */
export function isColumnVisible(key: string, preferences: ViewPreferences): boolean {
  return getVisibleColumnKeys(preferences).includes(key);
}
