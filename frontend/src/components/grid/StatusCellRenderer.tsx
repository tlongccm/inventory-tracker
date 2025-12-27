/**
 * StatusCellRenderer - AG Grid cell renderer for status badges.
 * Displays a styled badge with color based on equipment status.
 */

import type { ICellRendererParams } from 'ag-grid-community';

function getStatusClass(status: string): string {
  switch (status) {
    case 'Active':
      return 'status-active';
    case 'Inactive':
      return 'status-inactive';
    case 'Decommissioned':
      return 'status-decommissioned';
    case 'In Repair':
      return 'status-in-repair';
    case 'In Storage':
      return 'status-in-storage';
    default:
      return '';
  }
}

export default function StatusCellRenderer(props: ICellRendererParams) {
  const status = props.value;
  if (!status) return <span>-</span>;
  return <span className={`status-badge ${getStatusClass(status)}`}>{status}</span>;
}
