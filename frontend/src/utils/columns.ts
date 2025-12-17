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
 * Always includes: Equipment ID, Sub Type, User, Name
 * Optionally includes: view group columns based on preferences
 * Always last: Status column
 */
export function getVisibleColumns(preferences: ViewPreferences): ColumnDefinition[] {
  const columns: ColumnDefinition[] = [...ALWAYS_VISIBLE_COLUMNS];

  // Add columns from active view groups in defined order
  for (const group of VIEW_GROUP_KEYS) {
    if (preferences[group]) {
      columns.push(...VIEW_GROUP_COLUMNS[group]);
    }
  }

  // Status column is always last
  columns.push(STATUS_COLUMN);

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
