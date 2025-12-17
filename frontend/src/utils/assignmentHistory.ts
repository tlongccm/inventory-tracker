// Assignment history utility functions
import type { Equipment, AssignmentHistoryItem } from '../types/equipment';

/**
 * Extended assignment history record with current flag.
 */
export interface AssignmentHistoryRecord {
  id: number | string;
  user: string | null;
  usageType: string | null;
  equipmentName: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
}

/**
 * Builds a combined assignment history including the current assignment.
 * Current assignment appears first with isCurrent flag set to true.
 */
export function buildAssignmentHistory(
  equipment: Equipment,
  history: AssignmentHistoryItem[]
): AssignmentHistoryRecord[] {
  const records: AssignmentHistoryRecord[] = [];

  // Add current assignment as first record if equipment has a user
  if (equipment.primary_user) {
    records.push({
      id: 'current',
      user: equipment.primary_user,
      usageType: equipment.usage_type,
      equipmentName: equipment.equipment_name,
      startDate: equipment.assignment_date,
      endDate: null,
      isCurrent: true,
    });
  }

  // Add historical records
  history.forEach((h) => {
    records.push({
      id: h.id,
      user: h.previous_user,
      usageType: h.previous_usage_type,
      equipmentName: h.previous_equipment_name,
      startDate: h.start_date,
      endDate: h.end_date,
      isCurrent: false,
    });
  });

  return records;
}
