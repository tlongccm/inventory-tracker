/**
 * EquipmentList component - displays equipment in a table with configurable columns.
 * Supports sortable columns and user-resizable column widths.
 */

import { useRef, useCallback } from 'react';
import type { EquipmentListItem } from '../types/equipment';
import type { ColumnDefinition } from '../config/columns';

interface EquipmentListProps {
  equipment: EquipmentListItem[];
  loading: boolean;
  onSelect: (equipmentId: string) => void;
  onReassign?: (equipmentId: string) => void;
  selectedId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  visibleColumns: ColumnDefinition[];
  noResultsMessage?: string;
  // Column width management
  columnWidths: Record<string, number>;
  onColumnResize?: (column: string, width: number) => void;
}

// Columns that should have fixed width (not resizable)
const FIXED_WIDTH_COLUMNS = new Set<string>();

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

/**
 * Formats a cell value for display.
 */
function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  return String(value);
}

export default function EquipmentList({
  equipment,
  loading,
  onSelect,
  onReassign,
  selectedId,
  sortBy,
  sortOrder,
  onSort,
  visibleColumns,
  noResultsMessage,
  columnWidths,
  onColumnResize,
}: EquipmentListProps) {
  const resizingRef = useRef<{
    column: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  // Handle mouse down on resize handle
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, column: string, currentWidth: number) => {
      e.preventDefault();
      e.stopPropagation();

      resizingRef.current = {
        column,
        startX: e.clientX,
        startWidth: currentWidth,
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!resizingRef.current) return;

        const delta = moveEvent.clientX - resizingRef.current.startX;
        const newWidth = Math.max(30, resizingRef.current.startWidth + delta);
        onColumnResize?.(resizingRef.current.column, newWidth);
      };

      const handleMouseUp = () => {
        resizingRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [onColumnResize]
  );

  if (loading) {
    return <div className="loading">Loading equipment...</div>;
  }

  if (equipment.length === 0) {
    if (noResultsMessage) {
      return (
        <div className="no-results">
          <h3>No results found</h3>
          <p>{noResultsMessage}</p>
        </div>
      );
    }
    return (
      <div className="empty-state">
        <h3>No equipment found</h3>
        <p>No equipment is currently tracked in the inventory.</p>
        <p>Click "Add Equipment" to add the first record.</p>
      </div>
    );
  }

  const ResizableHeader = ({
    field,
    label,
    sortable,
    width,
  }: {
    field: string;
    label: string;
    sortable: boolean;
    width: number;
  }) => {
    const isActive = sortBy === field;
    const indicator = isActive
      ? sortOrder === 'asc'
        ? '▲'
        : '▼'
      : sortable
        ? '⇅'
        : null;
    const isResizable = !FIXED_WIDTH_COLUMNS.has(field);

    return (
      <th
        onClick={() => sortable && onSort?.(field)}
        className={`${sortable ? 'sortable' : ''} ${isResizable ? 'resizable' : ''}`.trim()}
        data-column={field}
        style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
      >
        <div className="th-content">
          {label}
          {indicator && (
            <span className={`sort-indicator ${isActive ? 'active' : ''}`}>
              {indicator}
            </span>
          )}
        </div>
        {onColumnResize && isResizable && (
          <div
            className="resize-handle"
            onMouseDown={(e) => handleResizeStart(e, field, width)}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </th>
    );
  };

  // Calculate total table width from column widths
  const actionsColumnWidth = onReassign ? 85 : 0;
  const totalTableWidth = visibleColumns.reduce(
    (sum, col) => sum + (columnWidths[col.key] || 60),
    actionsColumnWidth
  );

  return (
    <table className="resizable-table" style={{ width: `${totalTableWidth}px`, maxWidth: `${totalTableWidth}px` }}>
      <thead>
        <tr>
          {visibleColumns.map((col) => (
            <ResizableHeader
              key={col.key}
              field={col.key}
              label={col.label}
              sortable={col.sortable}
              width={columnWidths[col.key] || 60}
            />
          ))}
          {onReassign && <th style={{ width: '85px', minWidth: '85px', maxWidth: '85px' }}>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {equipment.map((item) => (
          <tr
            key={item.equipment_id}
            onClick={() => onSelect(item.equipment_id)}
            style={{
              cursor: 'pointer',
              backgroundColor:
                selectedId === item.equipment_id ? '#e3f2fd' : undefined,
            }}
          >
            {visibleColumns.map((col) => {
              const value = item[col.key as keyof EquipmentListItem];
              const width = columnWidths[col.key] || 60;
              // Special handling for status column
              if (col.key === 'status') {
                return (
                  <td key={col.key} data-column={col.key} style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}>
                    <span className={`status-badge ${getStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                );
              }
              return (
                <td key={col.key} data-column={col.key} style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}>
                  {formatCellValue(value)}
                </td>
              );
            })}
            {onReassign && (
              <td style={{ width: '85px', minWidth: '85px', maxWidth: '85px' }}>
                <button
                  className="action-btn reassign"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReassign(item.equipment_id);
                  }}
                >
                  Reassign
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
