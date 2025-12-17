/**
 * Hook for managing user-adjustable column widths with localStorage persistence.
 */

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'equipment-column-widths';

// Default column widths in pixels (sized to fit header text at minimum)
const DEFAULT_WIDTHS: Record<string, number> = {
  equipment_id: 105,      // "Equipment ID"
  computer_subtype: 75,   // "Sub Type"
  primary_user: 50,       // "User"
  equipment_name: 55,     // "Name"
  status: 75,             // "Status"
  manufacturer: 55,       // "Make"
  model: 55,              // "Model"
  location: 70,           // "Location"
  notes: 200,             // "Notes" - wider for content
  cpu_model: 85,          // "CPU Model"
  ram: 50,                // "RAM"
  storage: 65,            // "Storage"
  operating_system: 45,   // "OS"
  serial_number: 70,      // "Serial #"
  mac_address: 55,        // "MAC"
  cpu_score: 85,          // "CPU Score"
  score_2d: 75,           // "2D Score"
  score_3d: 75,           // "3D Score"
  memory_score: 90,       // "RAM Score"
  disk_score: 85,         // "Disk Score"
  overall_rating: 65,     // "Overall"
  assignment_date: 75,    // "Assigned"
  usage_type: 55,         // "Usage"
  ip_address: 85,         // "IP Address"
};

// Minimum column widths (reduced since text can wrap)
const MIN_WIDTHS: Record<string, number> = {
  equipment_id: 80,
  computer_subtype: 35,
  primary_user: 40,
  equipment_name: 30,
  status: 45,
  manufacturer: 40,
  model: 40,
  location: 40,
  notes: 50,
  cpu_model: 60,
  ram: 30,
  storage: 40,
  operating_system: 40,
  serial_number: 50,
  mac_address: 60,
  cpu_score: 35,
  score_2d: 35,
  score_3d: 35,
  memory_score: 35,
  disk_score: 35,
  overall_rating: 35,
  assignment_date: 50,
  usage_type: 35,
  ip_address: 60,
};

export interface ColumnWidthsState {
  widths: Record<string, number>;
  setColumnWidth: (column: string, width: number) => void;
  resetWidths: () => void;
  getWidth: (column: string) => number;
  getMinWidth: (column: string) => number;
}

export function useColumnWidths(): ColumnWidthsState {
  const [widths, setWidths] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_WIDTHS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to load column widths from localStorage:', e);
    }
    return DEFAULT_WIDTHS;
  });

  // Persist to localStorage when widths change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widths));
    } catch (e) {
      console.warn('Failed to save column widths to localStorage:', e);
    }
  }, [widths]);

  const setColumnWidth = useCallback((column: string, width: number) => {
    const minWidth = MIN_WIDTHS[column] || 30;
    const clampedWidth = Math.max(minWidth, Math.round(width));
    setWidths((prev) => ({
      ...prev,
      [column]: clampedWidth,
    }));
  }, []);

  const resetWidths = useCallback(() => {
    setWidths(DEFAULT_WIDTHS);
  }, []);

  const getWidth = useCallback(
    (column: string) => widths[column] || DEFAULT_WIDTHS[column] || 60,
    [widths]
  );

  const getMinWidth = useCallback(
    (column: string) => MIN_WIDTHS[column] || 30,
    []
  );

  return {
    widths,
    setColumnWidth,
    resetWidths,
    getWidth,
    getMinWidth,
  };
}
