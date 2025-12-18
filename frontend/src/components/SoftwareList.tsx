/**
 * SoftwareList component - displays software in a table with configurable columns.
 * Supports sortable columns and user-resizable column widths.
 */

import { useRef, useCallback } from 'react';
import type { SoftwareListItem } from '../types/software';
import type { SoftwareColumnDefinition } from '../utils/softwareColumns';

interface SoftwareListProps {
  software: SoftwareListItem[];
  loading: boolean;
  onSelect: (softwareId: string) => void;
  selectedId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  visibleColumns: SoftwareColumnDefinition[];
  noResultsMessage?: string;
  columnWidths: Record<string, number>;
  onColumnResize?: (column: string, width: number) => void;
}

function getStatusClass(status: string | null): string {
  switch (status) {
    case 'Active':
      return 'status-active';
    case 'Inactive':
      return 'status-inactive';
    case 'Expired':
      return 'status-decommissioned';
    case 'Retired':
      return 'status-in-storage';
    default:
      return '';
  }
}

function formatCellValue(value: unknown, key: string): string {
  if (value === null || value === undefined) {
    return '-';
  }
  if (key === 'cost' && typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }
  if (key === 'purchase_date' && typeof value === 'string') {
    return new Date(value).toLocaleDateString();
  }
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  return String(value);
}

export default function SoftwareList({
  software,
  loading,
  onSelect,
  selectedId,
  sortBy,
  sortOrder,
  onSort,
  visibleColumns,
  noResultsMessage,
  columnWidths,
  onColumnResize,
}: SoftwareListProps) {
  const resizingRef = useRef<{
    column: string;
    startX: number;
    startWidth: number;
  } | null>(null);

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
    return <div className="loading">Loading software...</div>;
  }

  if (software.length === 0) {
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
        <h3>No software found</h3>
        <p>No software is currently tracked in the inventory.</p>
        <p>Click "Add Software" to add the first record.</p>
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

    return (
      <th
        onClick={() => sortable && onSort?.(field)}
        className={`${sortable ? 'sortable' : ''} resizable`.trim()}
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
        {onColumnResize && (
          <div
            className="resize-handle"
            onMouseDown={(e) => handleResizeStart(e, field, width)}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </th>
    );
  };

  const totalTableWidth = visibleColumns.reduce(
    (sum, col) => sum + (columnWidths[col.key] || col.width || 100),
    0
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
              width={columnWidths[col.key] || col.width || 100}
            />
          ))}
        </tr>
      </thead>
      <tbody>
        {software.map((item) => (
          <tr
            key={item.software_id}
            onClick={() => onSelect(item.software_id)}
            style={{
              cursor: 'pointer',
              backgroundColor:
                selectedId === item.software_id ? '#e3f2fd' : undefined,
            }}
          >
            {visibleColumns.map((col) => {
              const value = item[col.key as keyof SoftwareListItem];
              const width = columnWidths[col.key] || col.width || 100;

              if (col.key === 'status') {
                return (
                  <td key={col.key} data-column={col.key} style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}>
                    <span className={`status-badge ${getStatusClass(item.status)}`}>
                      {item.status || '-'}
                    </span>
                  </td>
                );
              }
              return (
                <td key={col.key} data-column={col.key} style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}>
                  {formatCellValue(value, col.key)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
