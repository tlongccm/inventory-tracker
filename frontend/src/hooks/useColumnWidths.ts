/**
 * Hook for managing user-adjustable column widths with localStorage persistence.
 */

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'equipment-column-widths';

// Default column widths in pixels (sized to fit header text at minimum)
const DEFAULT_WIDTHS: Record<string, number> = {
  // Always visible
  equipment_id: 105,           // "Equipment ID"
  computer_subtype: 90,        // "Subcategory"
  primary_user: 80,            // "User"
  equipment_name: 80,          // "Name"
  status: 75,                  // "Status"
  // Summary view
  equipment_type: 75,          // "Category"
  manufacturer: 100,           // "Manufacturer"
  model: 80,                   // "Model"
  purpose: 80,                 // "Purpose"
  ip_address: 100,             // "IP Address"
  overall_rating: 100,         // "Overall Rating"
  // Spec view
  cpu_model: 100,              // "CPU Model"
  cpu_speed: 110,              // "CPU Base Speed"
  operating_system: 120,       // "Operating System"
  ram: 60,                     // "RAM"
  storage: 80,                 // "Storage"
  video_card: 90,              // "Video Card"
  display_resolution: 120,     // "Display Resolution"
  mac_lan: 110,                // "MAC (LAN)"
  mac_wlan: 110,               // "MAC (WLAN)"
  // Performance view
  cpu_score: 85,               // "CPU Score"
  score_2d: 75,                // "2D Score"
  score_3d: 75,                // "3D Score"
  memory_score: 100,           // "Memory Score"
  disk_score: 85,              // "Disk Score"
  // History view
  manufacturing_date: 130,     // "Manufacturing Date"
  acquisition_date: 120,       // "Acquisition Date"
  assignment_date: 120,        // "Assignment Date"
  cost: 70,                    // "Cost"
  notes: 200,                  // "Notes" - wider for content
  // Legacy (keep for compatibility)
  location: 70,
  serial_number: 70,
  usage_type: 55,
};

// Minimum column widths (reduced since text can wrap)
const MIN_WIDTHS: Record<string, number> = {
  // Always visible
  equipment_id: 80,
  computer_subtype: 60,
  primary_user: 50,
  equipment_name: 50,
  status: 50,
  // Summary view
  equipment_type: 60,
  manufacturer: 60,
  model: 50,
  purpose: 50,
  ip_address: 80,
  overall_rating: 60,
  // Spec view
  cpu_model: 60,
  cpu_speed: 60,
  operating_system: 60,
  ram: 40,
  storage: 50,
  video_card: 60,
  display_resolution: 80,
  mac_lan: 80,
  mac_wlan: 80,
  // Performance view
  cpu_score: 50,
  score_2d: 50,
  score_3d: 50,
  memory_score: 50,
  disk_score: 50,
  // History view
  manufacturing_date: 80,
  acquisition_date: 80,
  assignment_date: 80,
  cost: 50,
  notes: 80,
  // Legacy
  location: 40,
  serial_number: 50,
  usage_type: 35,
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
