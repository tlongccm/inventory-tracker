// Custom hook for managing view preferences with localStorage persistence
import { useState, useCallback } from 'react';
import type { ViewPreferences, ViewGroupKey } from '../types/viewGroups';
import { DEFAULT_VIEW_PREFERENCES } from '../types/viewGroups';

const STORAGE_KEY = 'inventory-view-preferences';

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
      typeof parsed.machineSpec !== 'boolean' ||
      typeof parsed.machinePerformance !== 'boolean' ||
      typeof parsed.assignment !== 'boolean'
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
 */
export function useViewPreferences() {
  const [preferences, setPreferences] = useState<ViewPreferences>(loadPreferences);

  const toggleGroup = useCallback((group: ViewGroupKey) => {
    setPreferences((prev) => {
      const updated = {
        ...prev,
        [group]: !prev[group],
      };
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
