/**
 * @fileoverview Colored status badge for entity states.
 */

import { memo, type JSX } from 'react';

/**
 * Maps known status strings to display colors.
 */
const STATUS_COLORS: Record<string, string> = {
  active: '#27ae60',
  inactive: '#95a5a6',
  disabled: '#7f8c8d',
  disconnected: '#7f8c8d',
  archived: '#7f8c8d',
  pending: '#f39c12',
  completed: '#27ae60',
  approved: '#2ecc71',
  rejected: '#e74c3c',
  scheduled: '#3498db',
  strategic: '#1abc9c',
  weekly: '#16a085',
  onboarding: '#8e44ad',
  paused: '#f39c12',
  error: '#e74c3c',
  review: '#3498db',
  draft: '#95a5a6',
  new: '#3498db',
  contacted: '#f39c12',
  qualified: '#9b59b6',
  discarded: '#e74c3c',
  converted: '#27ae60',
  lost: '#e74c3c',
  in_progress: '#3498db',
  on_hold: '#f39c12',
  cancelled: '#e74c3c',
};

/**
 * Props for the status badge.
 */
export interface StatusBadgeProps {
  /** Machine status value (e.g. `in_progress`). */
  status: string;
}

/**
 * Renders a human-readable status pill with a color derived from the status.
 */
export const StatusBadge = memo(function StatusBadge({ status }: StatusBadgeProps): JSX.Element {
  const color = STATUS_COLORS[status] || '#666';
  return (
    <span
      className="status-badge"
      style={{ backgroundColor: `${color}20`, color, borderColor: color }}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
});
