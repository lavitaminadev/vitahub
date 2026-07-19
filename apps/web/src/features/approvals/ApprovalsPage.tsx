import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { StatusBadge } from '../../shared/StatusBadge';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { EmptyState } from '../../shared/EmptyState';

interface ApprovalItem {
  id: string;
  pieceTitle: string;
  clientName: string;
  requestedBy: string;
  status: string;
  createdAt: string;
  versionUrl?: string;
}

export function ApprovalsPage() {
  const queryClient = useQueryClient();

  const { data: approvals, isLoading, error } = useQuery<ApprovalItem[]>({
    queryKey: ['approvals'],
    queryFn: () => api.get('/approvals'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/approvals/${id}`, { status: 'approved' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approvals'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.put(`/approvals/${id}`, { status: 'rejected' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approvals'] }),
  });

  if (isLoading) return <LoadingSpinner text="Cargando aprobaciones..." />;
  if (error) return <div className="alert alert-error">Error al cargar aprobaciones</div>;

  const pendingApprovals = (approvals ?? []).filter((approval) => approval.status === 'pending');

  return (
    <div className="page">
      <h1>Aprobaciones pendientes</h1>
      <p className="page-subtitle">Gestiona revisiones, abre la pieza final y resuelve el ciclo de feedback sin salir del flujo.</p>

      {pendingApprovals.length === 0 ? (
        <EmptyState
          icon="OK"
          title="Nada pendiente"
          description="Todas las aprobaciones activas ya fueron resueltas."
        />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pieza</th>
                <th>Cliente</th>
                <th>Solicitante</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map((approval) => (
                <tr key={approval.id}>
                  <td>{approval.pieceTitle}</td>
                  <td>{approval.clientName}</td>
                  <td>{approval.requestedBy}</td>
                  <td><StatusBadge status={approval.status} /></td>
                  <td>{new Date(approval.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    {approval.versionUrl && (
                      <a className="btn btn-sm btn-outline" href={approval.versionUrl} target="_blank" rel="noreferrer">
                        Ver pieza
                      </a>
                    )}
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => approveMutation.mutate(approval.id)}
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? 'Aprobando...' : 'Aprobar'}
                    </button>
                    <button
                      className="btn btn-sm btn-outline btn-danger"
                      onClick={() => {
                        if (window.confirm('¿Rechazar esta aprobación?')) rejectMutation.mutate(approval.id);
                      }}
                      disabled={rejectMutation.isPending}
                    >
                      {rejectMutation.isPending ? 'Rechazando...' : 'Rechazar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
