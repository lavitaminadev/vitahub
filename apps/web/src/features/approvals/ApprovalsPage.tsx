import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { StatusBadge } from '../../shared/StatusBadge';
import { LoadingSpinner } from '../../shared/LoadingSpinner';

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

  return (
    <div className="page">
      <h1>Aprobaciones Pendientes</h1>
      {(approvals?.length ?? 0) === 0 ? (
        <div className="alert alert-info">No hay aprobaciones pendientes</div>
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
              {approvals?.map((a) => (
                <tr key={a.id}>
                  <td>{a.pieceTitle}</td>
                  <td>{a.clientName}</td>
                  <td>{a.requestedBy}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    {a.status === 'pending' && (
                      <>
                        <button className="btn btn-sm btn-primary" onClick={() => approveMutation.mutate(a.id)} disabled={approveMutation.isPending}>
                          Aprobar
                        </button>
                        <button className="btn btn-sm btn-outline" onClick={() => rejectMutation.mutate(a.id)} disabled={rejectMutation.isPending}>
                          Rechazar
                        </button>
                      </>
                    )}
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
