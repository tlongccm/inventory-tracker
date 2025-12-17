// Search utility functions for universal search functionality
import type { Equipment } from '../types/equipment';

/**
 * Escapes special regex characters in a string for literal matching.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validates a regex pattern and returns validation result.
 */
export function validateRegex(pattern: string): { valid: boolean; error?: string } {
  if (!pattern) {
    return { valid: true };
  }
  try {
    new RegExp(pattern);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

/**
 * Filters equipment list based on search term across all fields.
 * Searches all stringified field values including hidden fields.
 */
export function filterEquipment(
  items: Equipment[],
  searchTerm: string,
  isRegex: boolean
): Equipment[] {
  if (!searchTerm.trim()) {
    return items;
  }

  try {
    const pattern = isRegex
      ? new RegExp(searchTerm, 'i')
      : new RegExp(escapeRegex(searchTerm), 'i');

    return items.filter((item) => {
      // Concatenate all field values into searchable text
      const searchableText = Object.values(item)
        .filter((v) => v !== null && v !== undefined)
        .map((v) => String(v))
        .join(' ');
      return pattern.test(searchableText);
    });
  } catch {
    // Invalid regex - return original list
    return items;
  }
}
