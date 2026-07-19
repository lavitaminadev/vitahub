/**
 * @fileoverview Generic sortable data table with typed columns.
 */

import { useMemo, useState, type JSX } from 'react';

/**
 * Column descriptor for the data table.
 *
 * @template T - Row type.
 */
export interface Column<T> {
  /** Unique key used for sorting and default cell rendering. */
  key: keyof T;
  /** Header label. */
  label: string;
  /** Whether the column is sortable. */
  sortable?: boolean;
  /** Optional custom renderer for the cell. */
  render?: (row: T) => React.ReactNode;
  /** Optional typed sort accessor for comparing rows. */
  sortValue?: (row: T) => string | number | null | undefined;
}

/**
 * Props for the generic data table.
 *
 * @template T - Row type.
 */
export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  /** Function that returns a stable, unique identifier for a row. */
  keyExtractor: (row: T) => string | number;
  /** Whether data is loading. */
  loading?: boolean;
  /** Message shown when the data array is empty. */
  emptyMessage?: string;
}

/**
 * Generic sortable table component.
 *
 * @template T - Row type; must be an object with string keys.
 */
export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  loading,
  emptyMessage = 'No hay datos',
}: DataTableProps<T>): JSX.Element {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  /**
   * Toggle sort direction or select a new sort column.
   *
   * @param key - Column key to sort by.
   */
  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Memoize sorting so it is not recomputed on every render.
  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const column = columns.find((c) => c.key === sortKey);
    return [...data].sort((a, b) => {
      const va = column?.sortValue ? column.sortValue(a) : a[sortKey];
      const vb = column?.sortValue ? column.sortValue(b) : b[sortKey];
      if (va == null) return 1;
      if (vb == null) return -1;
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, columns]);

  if (loading) {
    return <div className="table-loading">Cargando...</div>;
  }

  if (!data.length) {
    return <div className="table-empty">{emptyMessage}</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={col.sortable ? 'sortable' : ''}
                onClick={() => col.sortable && handleSort(col.key)}
                style={{ cursor: col.sortable ? 'pointer' : undefined }}
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="sort-indicator">{sortDir === 'asc' ? ' ▲' : ' ▼'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={keyExtractor(row)}>
              {columns.map((col) => (
                <td key={String(col.key)}>
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
