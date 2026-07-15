const STATUS_COLORS: Record<string, string> = {
  active: '#27ae60',
  inactive: '#95a5a6',
  pending: '#f39c12',
  completed: '#27ae60',
  approved: '#2ecc71',
  rejected: '#e74c3c',
  review: '#3498db',
  draft: '#95a5a6',
  new: '#3498db',
  contacted: '#f39c12',
  qualified: '#9b59b6',
  converted: '#27ae60',
  lost: '#e74c3c',
  in_progress: '#3498db',
  on_hold: '#f39c12',
  cancelled: '#e74c3c',
};

export function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || '#666';
  return (
    <span className="status-badge" style={{ backgroundColor: color + '20', color, borderColor: color }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
