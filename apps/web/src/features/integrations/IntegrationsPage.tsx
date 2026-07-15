import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { StatusBadge } from '../../shared/StatusBadge';
import { LoadingSpinner } from '../../shared/LoadingSpinner';

interface Integration {
  id: string;
  name: string;
  provider: string;
  status: string;
  lastSync: string;
  config: Record<string, unknown>;
}

export function IntegrationsPage() {
  const queryClient = useQueryClient();

  const { data: integrations, isLoading, error } = useQuery<Integration[]>({
    queryKey: ['integrations'],
    queryFn: () => api.get('/integrations'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/integrations/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integrations'] }),
  });

  if (isLoading) return <LoadingSpinner text="Cargando integraciones..." />;
  if (error) return <div className="alert alert-error">Error al cargar integraciones</div>;

  return (
    <div className="page">
      <h1>Integraciones</h1>
      {(integrations?.length ?? 0) === 0 ? (
        <div className="alert alert-info">No hay integraciones configuradas</div>
      ) : (
        <div className="integration-list">
          {integrations?.map((intg) => (
            <div key={intg.id} className="integration-card">
              <div className="integration-header">
                <span className="integration-icon">
                  {intg.provider === 'google' ? '🔴' : intg.provider === 'slack' ? '💬' : intg.provider === 'notion' ? '📘' : '🔗'}
                </span>
                <div className="integration-info">
                  <div className="integration-name">{intg.name}</div>
                  <div className="integration-provider">{intg.provider}</div>
                </div>
                <StatusBadge status={intg.status} />
              </div>
              <div className="integration-meta">
                Última sincronización: {intg.lastSync ? new Date(intg.lastSync).toLocaleString() : 'Nunca'}
              </div>
              <button
                className={`btn btn-sm ${intg.status === 'active' ? 'btn-outline' : 'btn-primary'}`}
                onClick={() => toggleMutation.mutate({ id: intg.id, status: intg.status === 'active' ? 'inactive' : 'active' })}
              >
                {intg.status === 'active' ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
