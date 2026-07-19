import { useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { DataTable } from '../../shared/DataTable';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { StatusBadge } from '../../shared/StatusBadge';

export function BriefsPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['briefs'], queryFn: () => api.get('/briefs') });
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-error">Error al cargar briefs</div>;
  const briefs: any[] = Array.isArray(data) ? data : (data as any)?.data ?? [];
  return (
    <div className="page">
      <h1>Briefs</h1>
      <DataTable
        keyExtractor={(r) => r.id as string}
        columns={[
          { key: 'title', label: 'Título', sortable: true },
          { key: 'clientId', label: 'Cliente' },
          { key: 'status', label: 'Estado', render: (r) => <StatusBadge status={r.status as string} /> },
          { key: 'dueDate', label: 'Vencimiento', render: (r) => r.dueDate ? new Date(r.dueDate as string).toLocaleDateString() : '-' },
          { key: 'createdAt', label: 'Creado', render: (r) => new Date(r.createdAt as string).toLocaleDateString() },
        ]}
        data={briefs}
      />
    </div>
  );
}
