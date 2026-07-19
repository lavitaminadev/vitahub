import { useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { DataTable } from '../../shared/DataTable';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { StatusBadge } from '../../shared/StatusBadge';

export function ContractsPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['contracts'], queryFn: () => api.get('/contracts') });
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-error">Error al cargar contratos</div>;
  const contracts: any[] = Array.isArray(data) ? data : (data as any)?.data ?? [];
  return (
    <div className="page">
      <h1>Contratos</h1>
      <DataTable
        keyExtractor={(r) => r.id as string}
        columns={[
          { key: 'name', label: 'Nombre', sortable: true },
          { key: 'serviceType', label: 'Tipo de Servicio' },
          { key: 'monthlyUd', label: 'UD/mes', render: (r) => Number(r.monthlyUd).toString() },
          { key: 'startDate', label: 'Inicio', render: (r) => new Date(r.startDate as string).toLocaleDateString() },
          { key: 'endDate', label: 'Término', render: (r) => r.endDate ? new Date(r.endDate as string).toLocaleDateString() : '-' },
          { key: 'status', label: 'Estado', render: (r) => <StatusBadge status={r.status as string} /> },
        ]}
        data={contracts}
      />
    </div>
  );
}
