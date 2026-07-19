import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { StatusBadge } from '../../shared/StatusBadge';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { MetaConnectCard } from './MetaConnectCard';
import { GoogleConnectCard } from './GoogleConnectCard';

interface Integration {
  id: string;
  name: string;
  provider: string;
  status: string;
  lastSyncAt?: string;
  config: Record<string, unknown>;
  health?: string;
}

const PROVIDER_ICONS: Record<string, string> = {
  google: 'G',
  slack: 'S',
  notion: 'N',
  meta: 'M',
};

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

  const metaIntegration = integrations?.find((item) => item.provider === 'meta');
  const googleIntegration = integrations?.find((item) => item.provider === 'google');
  const otherIntegrations = integrations?.filter((item) => item.provider !== 'meta' && item.provider !== 'google');

  return (
    <div className="page">
      <h1>Integraciones</h1>
      <p className="page-subtitle">
        Conecta proveedores, descubre activos reales, revisa salud y deja cada flujo operativo sin pasos sueltos.
      </p>

      <h2>Meta (Facebook/Instagram)</h2>
      <MetaConnectCard integration={metaIntegration} />

      <h2>Google</h2>
      <GoogleConnectCard integration={googleIntegration} />

      {(otherIntegrations?.length ?? 0) > 0 && (
        <>
          <h2>Otras integraciones</h2>
          <div className="integration-list">
            {otherIntegrations?.map((integration) => (
              <div key={integration.id} className="integration-card">
                <div className="integration-header">
                  <span className="integration-icon">{PROVIDER_ICONS[integration.provider] || '?'}</span>
                  <div className="integration-info">
                    <div className="integration-name">{integration.name}</div>
                    <div className="integration-provider">{integration.provider}</div>
                  </div>
                  <StatusBadge status={integration.status} />
                </div>

                <div className="integration-meta">
                  Última sincronización:{' '}
                  {integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleString() : 'Nunca'}
                </div>

                <button
                  className={`btn btn-sm ${integration.status === 'active' ? 'btn-outline' : 'btn-primary'}`}
                  onClick={() =>
                    toggleMutation.mutate({
                      id: integration.id,
                      status: integration.status === 'active' ? 'disabled' : 'active',
                    })
                  }
                >
                  {integration.status === 'active' ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {(otherIntegrations?.length ?? 0) === 0 && !metaIntegration && !googleIntegration && (
        <div className="alert alert-info">No hay integraciones configuradas todavía.</div>
      )}
    </div>
  );
}
