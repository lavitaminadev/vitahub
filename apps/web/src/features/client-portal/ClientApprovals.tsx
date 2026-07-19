import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { StatusBadge } from '../../shared/StatusBadge';
import { EmptyState } from '../../shared/EmptyState';

interface ClientApprovalItem {
  id: string;
  pieceId?: string;
  pieceTitle?: string;
  status: string;
  createdAt?: string;
  versionUrl?: string;
  decisionNotes?: string;
}

export function ClientApprovals() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<ClientApprovalItem[]>({
    queryKey: ['client-approvals'],
    queryFn: () => api.get('/approvals'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/approvals/${id}`, { status: 'approved' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-approvals'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, decisionNotes }: { id: string; decisionNotes?: string }) =>
      api.put(`/approvals/${id}`, { status: 'rejected', decisionNotes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-approvals'] }),
  });

  if (isLoading) return <LoadingSpinner text="Cargando aprobaciones..." />;
  if (error) return <div className="alert alert-error">Error al cargar aprobaciones</div>;

  const approvals = Array.isArray(data) ? data.filter((item) => item.status === 'pending') : [];

  return (
    <div className="page">
      <h1>Mis aprobaciones</h1>
      <p className="page-subtitle">Revisa piezas pendientes, abre la version entregada y responde desde el portal.</p>

      {approvals.length === 0 ? (
        <EmptyState
          icon="OK"
          title="Sin piezas pendientes"
          description="No tienes aprobaciones activas por revisar en este momento."
        />
      ) : (
        <div className="portal-list">
          {approvals.map((approval) => (
            <div key={approval.id} className="card portal-item-card">
              <div>
                <h3>{approval.pieceTitle || approval.pieceId || 'Pieza pendiente'}</h3>
                <div className="portal-item-meta">
                  <StatusBadge status={approval.status} />
                  <span>{approval.createdAt ? new Date(approval.createdAt).toLocaleDateString() : 'Sin fecha'}</span>
                </div>
              </div>
              <div className="portal-item-actions">
                {approval.versionUrl && (
                  <a className="btn btn-outline btn-sm" href={approval.versionUrl} target="_blank" rel="noreferrer">
                    Ver pieza
                  </a>
                )}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => approveMutation.mutate(approval.id)}
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending ? 'Aprobando...' : 'Aprobar'}
                </button>
                <button
                  className="btn btn-outline btn-sm btn-danger"
                  onClick={() => {
                    const notes = window.prompt('Indica el motivo del rechazo para que el equipo lo procese en correccion:', '');
                    if (notes !== null) rejectMutation.mutate({ id: approval.id, decisionNotes: notes || undefined });
                  }}
                  disabled={rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? 'Rechazando...' : 'Rechazar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
