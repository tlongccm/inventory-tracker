// Custom hook for managing view preferences with localStorage persistence
import { useState, useCallback } from 'react';
import type { ViewPreferences, ViewGroupKey } from '../types/viewGroups';
import { DEFAULT_VIEW_PREFERENCES } from '../types/viewGroups';

const STORAGE_KEY = 'inventory-view-preferences';

// Individual view groups (excluding 'full' meta-toggle)
const INDIVIDUAL_VIEWS: (keyof ViewPreferences)[] = ['summary', 'spec', 'performance', 'history'];

/**
 * Loads view preferences from localStorage.
 * Returns defaults if unavailable or invalid.
 */
function loadPreferences(): ViewPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_VIEW_PREFERENCES;
    }
    const parsed = JSON.parse(stored);
    // Validate structure - ensure all keys exist
    if (
      typeof parsed.summary !== 'boolean' ||
      typeof parsed.spec !== 'boolean' ||
      typeof parsed.performance !== 'boolean' ||
      typeof parsed.history !== 'boolean' ||
      typeof parsed.full !== 'boolean'
    ) {
      return DEFAULT_VIEW_PREFERENCES;
    }
    return parsed;
  } catch {
    // JSON parse error or localStorage unavailable
    return DEFAULT_VIEW_PREFERENCES;
  }
}

/**
 * Saves view preferences to localStorage.
 */
function savePreferences(prefs: ViewPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage unavailable - ignore
  }
}

/**
 * Hook for managing view group preferences with localStorage persistence.
 * Handles 'full' as a meta-toggle that enables/disables all views.
 */
export function useViewPreferences() {
  const [preferences, setPreferences] = useState<ViewPreferences>(loadPreferences);

  const toggleGroup = useCallback((group: ViewGroupKey) => {
    setPreferences((prev) => {
      let updated: ViewPreferences;

      if (group === 'full') {
        // Toggle all views on or off
        const newValue = !prev.full;
        updated = {
          summary: newValue,
          spec: newValue,
          performance: newValue,
          history: newValue,
          full: newValue,
        };
      } else {
        // Toggle individual view
        const newValue = !prev[group];
        updated = {
          ...prev,
          [group]: newValue,
        };

        // Check if all individual views are now enabled -> enable full
        // Or if any individual view is disabled -> disable full
        const allEnabled = INDIVIDUAL_VIEWS.every(
          (view) => view === group ? newValue : prev[view]
        );
        updated.full = allEnabled;
      }

      savePreferences(updated);
      return updated;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_VIEW_PREFERENCES);
    savePreferences(DEFAULT_VIEW_PREFERENCES);
  }, []);

  return {
    preferences,
    toggleGroup,
    resetPreferences,
  };
}
