import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { StatusBadge } from '../../shared/StatusBadge';

const REDIRECT_URI = `${window.location.origin}/integrations/google/callback`;

interface GoogleIntegration {
  id: string;
  name: string;
  status: string;
  health?: string;
  lastSyncAt?: string;
}

interface GoogleConnectCardProps {
  integration?: GoogleIntegration;
}

export function GoogleConnectCard({ integration }: GoogleConnectCardProps) {
  const queryClient = useQueryClient();

  const { data: authData } = useQuery<{ url: string }>({
    queryKey: ['google-auth-url'],
    queryFn: () => api.get(`/integrations/google/auth-url?redirect_uri=${encodeURIComponent(REDIRECT_URI)}`),
    enabled: !integration || integration.status !== 'active',
  });

  const { data: statusData } = useQuery<{ configured: boolean; clientId: string | null }>({
    queryKey: ['google-status'],
    queryFn: () => api.get('/integrations/google/status'),
  });

  const refreshMutation = useMutation({
    mutationFn: () => api.post(`/integrations/google/${integration?.id}/refresh`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integrations'] }),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => api.put(`/integrations/${integration?.id}`, { status: 'disabled' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integrations'] }),
  });

  const handleConnect = () => {
    if (!statusData?.configured) {
      alert('Google no está configurado en el servidor. Revisa GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET.');
      return;
    }
    if (!authData?.url) return;

    const popup = window.open(authData.url, 'google-oauth', 'width=600,height=700');

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.provider !== 'google') return;
      if (event.data?.type === 'oauth:success' || event.data?.type === 'oauth:error') {
        void queryClient.invalidateQueries({ queryKey: ['integrations'] });
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);

    const timer = window.setInterval(() => {
      if (popup?.closed) {
        window.clearInterval(timer);
        void queryClient.invalidateQueries({ queryKey: ['integrations'] });
        window.removeEventListener('message', handleMessage);
      }
    }, 1000);
  };

  const isConnected = integration?.status === 'active';
  const healthColor =
    integration?.health === 'healthy' ? '#27ae60' : integration?.health === 'degraded' ? '#f39c12' : '#95a5a6';

  return (
    <div className="integration-card google-card">
      <div className="integration-header">
        <span className="integration-icon">G</span>
        <div className="integration-info">
          <div className="integration-name">Google</div>
          <div className="integration-provider">google</div>
        </div>
        <StatusBadge status={isConnected ? 'active' : 'disconnected'} />
      </div>

      {!statusData?.configured && (
        <div className="alert alert-warning">
          Google no está configurado en el servidor. Define `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.
        </div>
      )}

      {integration && (
        <div className="integration-meta">
          <div className="meta-detail">
            <span className="meta-label">ID:</span>
            <span className="meta-value">{integration.id}</span>
          </div>
          {integration.lastSyncAt && (
            <div className="meta-detail">
              <span className="meta-label">Última sincronización:</span>
              <span className="meta-value">{new Date(integration.lastSyncAt).toLocaleString()}</span>
            </div>
          )}
          <div className="meta-detail">
            <span className="meta-label">Health:</span>
            <span className="meta-value" style={{ color: healthColor, fontWeight: 600 }}>
              {integration.health || 'unknown'}
            </span>
          </div>
        </div>
      )}

      <div className="integration-actions">
        {!isConnected ? (
          <button className="btn btn-primary" onClick={handleConnect} disabled={!authData?.url}>
            Conectar con Google
          </button>
        ) : (
          <>
            <button className="btn btn-outline" onClick={() => refreshMutation.mutate()} disabled={refreshMutation.isPending}>
              {refreshMutation.isPending ? 'Refrescando...' : 'Refrescar token'}
            </button>
            <button
              className="btn btn-outline btn-danger"
              onClick={() => {
                if (window.confirm('¿Estás seguro de desconectar Google?')) disconnectMutation.mutate();
              }}
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending ? 'Desconectando...' : 'Desconectar'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
