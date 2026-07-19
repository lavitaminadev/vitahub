import { useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { DataTable } from '../../shared/DataTable';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { StatusBadge } from '../../shared/StatusBadge';

export function BillingPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['invoices'], queryFn: () => api.get('/billing/invoices') });
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-error">Error al cargar facturas</div>;
  const invoices: any[] = Array.isArray(data) ? data : (data as any)?.data ?? [];
  return (
    <div className="page">
      <h1>Facturación</h1>
      <DataTable
        keyExtractor={(r) => r.id as string}
        columns={[
          { key: 'number', label: 'N° Factura', sortable: true },
          { key: 'clientId', label: 'Cliente' },
          { key: 'amount', label: 'Monto', render: (r) => `$${Number(r.amount).toLocaleString()}` },
          { key: 'status', label: 'Estado', render: (r) => <StatusBadge status={r.status as string} /> },
          { key: 'issuedAt', label: 'Emisión', render: (r) => new Date(r.issuedAt as string).toLocaleDateString() },
        ]}
        data={invoices}
      />
    </div>
  );
}
