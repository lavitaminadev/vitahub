import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { StatusBadge } from '../../shared/StatusBadge';

const REDIRECT_URI = `${window.location.origin}/integrations/meta/callback`;

interface MetaIntegration {
  id: string;
  name: string;
  status: string;
  health?: string;
  lastSyncAt?: string;
  config?: Record<string, unknown>;
}

interface AssetOption {
  id: string;
  name: string;
  selected: boolean;
}

interface MetaAssetsResponse {
  pages: Array<AssetOption & { category?: string }>;
  instagramProfiles: Array<AssetOption & { pageId?: string }>;
  adAccounts: Array<AssetOption & { accountStatus?: number; currency?: string; timezoneName?: string }>;
}

interface MetaHealthResponse {
  connected: boolean;
  tokenExpiresAt: string | null;
  selectedAssets: number;
  scopes: string[];
  leadCaptureReady?: boolean;
  credentialsEncrypted?: boolean;
  pixelId?: string | null;
}

interface MetaConnectCardProps {
  integration?: MetaIntegration;
}

function mapSelectedIds(items: AssetOption[]) {
  return items.filter((item) => item.selected).map((item) => item.id);
}

export function MetaConnectCard({ integration }: MetaConnectCardProps) {
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState(false);
  const [pixelId, setPixelId] = useState('');
  const [pixelValid, setPixelValid] = useState<boolean | null>(null);
  const [conversionResult, setConversionResult] = useState<string | null>(null);
  const [pages, setPages] = useState<MetaAssetsResponse['pages']>([]);
  const [instagramProfiles, setInstagramProfiles] = useState<MetaAssetsResponse['instagramProfiles']>([]);
  const [adAccounts, setAdAccounts] = useState<MetaAssetsResponse['adAccounts']>([]);
  const [selectionMessage, setSelectionMessage] = useState<string | null>(null);

  const isConnected = integration?.status === 'active';
  const healthColor =
    integration?.health === 'healthy' ? '#27ae60' : integration?.health === 'degraded' ? '#f39c12' : '#95a5a6';

  const { data: authData } = useQuery<{ url: string }>({
    queryKey: ['meta-auth-url'],
    queryFn: () => api.get(`/integrations/meta/auth-url?redirect_uri=${encodeURIComponent(REDIRECT_URI)}`),
    enabled: !isConnected,
  });

  const { data: statusData } = useQuery<{ configured: boolean; appId: string | null }>({
    queryKey: ['meta-status'],
    queryFn: () => api.get('/integrations/meta/status'),
  });

  const assetsQuery = useQuery<MetaAssetsResponse>({
    queryKey: ['meta-assets', integration?.id],
    queryFn: () => api.get(`/integrations/meta/${integration?.id}/assets`),
    enabled: Boolean(integration?.id && isConnected),
  });

  const healthQuery = useQuery<MetaHealthResponse>({
    queryKey: ['meta-health', integration?.id],
    queryFn: () => api.get(`/integrations/meta/${integration?.id}/health`),
    enabled: Boolean(integration?.id && isConnected),
  });

  useEffect(() => {
    if (!assetsQuery.data) return;
    setPages(assetsQuery.data.pages);
    setInstagramProfiles(assetsQuery.data.instagramProfiles);
    setAdAccounts(assetsQuery.data.adAccounts);
  }, [assetsQuery.data]);

  useEffect(() => {
    if (healthQuery.data?.pixelId) setPixelId(healthQuery.data.pixelId);
  }, [healthQuery.data?.pixelId]);

  const refreshMutation = useMutation({
    mutationFn: () => api.post(`/integrations/meta/${integration?.id}/refresh`),
    onSuccess: async () => {
      setSelectionMessage('Token actualizado correctamente.');
      await queryClient.invalidateQueries({ queryKey: ['integrations'] });
      await queryClient.invalidateQueries({ queryKey: ['meta-health', integration?.id] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => api.put(`/integrations/${integration?.id}`, { status: 'disabled' }),
    onSuccess: async () => {
      setSelectionMessage('Integracion desactivada.');
      await queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const saveAssetsMutation = useMutation({
    mutationFn: () =>
      api.post<{ saved: boolean; assets: MetaAssetsResponse }>(`/integrations/meta/${integration?.id}/assets`, {
        pageIds: mapSelectedIds(pages),
        instagramProfileIds: mapSelectedIds(instagramProfiles),
        adAccountIds: mapSelectedIds(adAccounts),
        primaryPageId: pages.find((item) => item.selected)?.id ?? null,
        primaryInstagramProfileId: instagramProfiles.find((item) => item.selected)?.id ?? null,
        primaryAdAccountId: adAccounts.find((item) => item.selected)?.id ?? null,
      }),
    onSuccess: async (data) => {
      setSelectionMessage('Seleccion de activos guardada y paginas suscritas.');
      setPages(data.assets.pages);
      setInstagramProfiles(data.assets.instagramProfiles);
      setAdAccounts(data.assets.adAccounts);
      await queryClient.invalidateQueries({ queryKey: ['integrations'] });
      await queryClient.invalidateQueries({ queryKey: ['meta-health', integration?.id] });
    },
  });

  const validatePixelMutation = useMutation({
    mutationFn: (dto: { pixelId: string }) =>
      api.post<{ valid: boolean }>(`/integrations/meta/${integration?.id}/pixel/validate`, dto),
    onSuccess: (data) => setPixelValid(data.valid),
    onError: () => setPixelValid(false),
  });

  const sendTestEventMutation = useMutation({
    mutationFn: () => api.post(`/integrations/meta/${integration?.id}/conversions/test`),
    onSuccess: () => setConversionResult('Evento de prueba enviado a Meta Events Manager.'),
    onError: (err: Error) => setConversionResult(err.message),
  });

  const selectedCounts = useMemo(
    () => ({
      pages: pages.filter((item) => item.selected).length,
      instagram: instagramProfiles.filter((item) => item.selected).length,
      ads: adAccounts.filter((item) => item.selected).length,
    }),
    [adAccounts, instagramProfiles, pages],
  );

  const handleConnect = () => {
    if (!statusData?.configured) {
      alert('Meta no esta configurado en el servidor. Revisa META_APP_ID y META_APP_SECRET.');
      return;
    }
    if (!authData?.url) return;

    setConnecting(true);
    const popup = window.open(authData.url, 'meta-oauth', 'width=600,height=700');

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.provider !== 'meta') return;

      if (event.data?.type === 'oauth:success') {
        setSelectionMessage('Conexion completada. Ya puedes descubrir y seleccionar activos.');
      }
      if (event.data?.type === 'oauth:success' || event.data?.type === 'oauth:error') {
        setConnecting(false);
        void queryClient.invalidateQueries({ queryKey: ['integrations'] });
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);

    const timer = window.setInterval(() => {
      if (popup?.closed) {
        window.clearInterval(timer);
        setConnecting(false);
        void queryClient.invalidateQueries({ queryKey: ['integrations'] });
        window.removeEventListener('message', handleMessage);
      }
    }, 1000);
  };

  const toggleItem = <T extends AssetOption>(items: T[], setItems: (next: T[]) => void, id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)));
    setSelectionMessage(null);
  };

  return (
    <div className="integration-card meta-card">
      <div className="integration-header">
        <span className="integration-icon">M</span>
        <div className="integration-info">
          <div className="integration-name">Meta (Facebook/Instagram)</div>
          <div className="integration-provider">meta</div>
        </div>
        <StatusBadge status={isConnected ? 'active' : 'disconnected'} />
      </div>

      {!statusData?.configured && (
        <div className="alert alert-warning">
          Meta no esta configurado en el servidor. Define `META_APP_ID` y `META_APP_SECRET`.
        </div>
      )}

      {selectionMessage && <div className="alert alert-success">{selectionMessage}</div>}
      {assetsQuery.error && <div className="alert alert-error">No se pudieron descubrir los activos de Meta.</div>}
      {healthQuery.error && <div className="alert alert-error">No se pudo consultar la salud de la integracion.</div>}

      {integration && (
        <div className="integration-meta-grid">
          <div className="integration-meta-card">
            <span className="meta-label">Estado</span>
            <span className="meta-value" style={{ color: healthColor }}>
              {integration.health || 'unknown'}
            </span>
          </div>
          <div className="integration-meta-card">
            <span className="meta-label">Ultima sincronizacion</span>
            <span className="meta-value">{integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleString() : 'Nunca'}</span>
          </div>
          <div className="integration-meta-card">
            <span className="meta-label">Activos seleccionados</span>
            <span className="meta-value">{healthQuery.data?.selectedAssets ?? 0}</span>
          </div>
          <div className="integration-meta-card">
            <span className="meta-label">Expiracion token</span>
            <span className="meta-value">
              {healthQuery.data?.tokenExpiresAt ? new Date(healthQuery.data.tokenExpiresAt).toLocaleString() : 'Sin fecha'}
            </span>
          </div>
          <div className="integration-meta-card">
            <span className="meta-label">Credenciales</span>
            <span className="meta-value">
              {healthQuery.data?.credentialsEncrypted ? 'Cifradas' : 'Requieren reconexion'}
            </span>
          </div>
        </div>
      )}

      {isConnected && !healthQuery.data?.leadCaptureReady && (
        <div className="alert alert-warning">
          La captura de leads aun no esta lista. Selecciona al menos una pagina y confirma permisos `leads_retrieval` y `pages_manage_ads`.
        </div>
      )}

      <div className="integration-actions">
        {!isConnected ? (
          <button className="btn btn-primary" onClick={handleConnect} disabled={connecting || !authData?.url}>
            {connecting ? 'Conectando...' : 'Conectar con Meta'}
          </button>
        ) : (
          <>
            <button className="btn btn-outline" onClick={() => assetsQuery.refetch()} disabled={assetsQuery.isFetching}>
              {assetsQuery.isFetching ? 'Sincronizando...' : 'Descubrir activos'}
            </button>
            <button className="btn btn-outline" onClick={() => refreshMutation.mutate()} disabled={refreshMutation.isPending}>
              {refreshMutation.isPending ? 'Refrescando...' : 'Refrescar token'}
            </button>
            <button
              className="btn btn-outline btn-danger"
              onClick={() => {
                if (window.confirm('Seguro que quieres desactivar Meta?')) disconnectMutation.mutate();
              }}
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending ? 'Desactivando...' : 'Desactivar'}
            </button>
          </>
        )}
      </div>

      {isConnected && (
        <div className="integration-section">
          <div className="integration-section-head">
            <div>
              <h4>Flujo Meta</h4>
              <p className="page-subtitle">Descubre, valida, selecciona y activa los activos que usa la operacion para inbox, formularios y Ads.</p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => saveAssetsMutation.mutate()}
              disabled={saveAssetsMutation.isPending || !integration?.id}
            >
              {saveAssetsMutation.isPending ? 'Guardando...' : 'Guardar seleccion'}
            </button>
          </div>

          <div className="meta-health-strip">
            <div className="meta-health-item">
              <strong>Paginas</strong>
              <span>{selectedCounts.pages} seleccionadas</span>
            </div>
            <div className="meta-health-item">
              <strong>Instagram</strong>
              <span>{selectedCounts.instagram} seleccionados</span>
            </div>
            <div className="meta-health-item">
              <strong>Ads</strong>
              <span>{selectedCounts.ads} seleccionados</span>
            </div>
            <div className="meta-health-item">
              <strong>Scopes</strong>
              <span>{healthQuery.data?.scopes.length ?? 0} concedidos</span>
            </div>
            <div className="meta-health-item">
              <strong>Lead Ads</strong>
              <span>{healthQuery.data?.leadCaptureReady ? 'Listo' : 'Pendiente'}</span>
            </div>
          </div>

          <div className="asset-grid">
            <section className="asset-panel">
              <h5>Paginas</h5>
              <p className="page-subtitle">Necesarias para webhooks, inbox, Instagram y recepcion de `leadgen` en tiempo real.</p>
              {pages.length === 0 ? (
                <div className="asset-empty">Sin paginas descubiertas todavia.</div>
              ) : (
                <div className="asset-list">
                  {pages.map((page) => (
                    <label key={page.id} className="asset-item">
                      <input type="checkbox" checked={page.selected} onChange={() => toggleItem(pages, setPages, page.id)} />
                      <span>
                        <strong>{page.name}</strong>
                        <small>{page.category || 'Sin categoria'}</small>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </section>

            <section className="asset-panel">
              <h5>Perfiles de Instagram</h5>
              <p className="page-subtitle">Usados para mensajeria, perfil e interacciones del canal.</p>
              {instagramProfiles.length === 0 ? (
                <div className="asset-empty">Sin perfiles conectados a las paginas seleccionadas.</div>
              ) : (
                <div className="asset-list">
                  {instagramProfiles.map((profile) => (
                    <label key={profile.id} className="asset-item">
                      <input
                        type="checkbox"
                        checked={profile.selected}
                        onChange={() => toggleItem(instagramProfiles, setInstagramProfiles, profile.id)}
                      />
                      <span>
                        <strong>{profile.name}</strong>
                        <small>{profile.pageId ? `Pagina ${profile.pageId}` : 'Sin pagina asociada'}</small>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </section>

            <section className="asset-panel">
              <h5>Cuentas publicitarias</h5>
              <p className="page-subtitle">Base para campanas, insights y reporting de Ads.</p>
              {adAccounts.length === 0 ? (
                <div className="asset-empty">Sin cuentas publicitarias descubiertas.</div>
              ) : (
                <div className="asset-list">
                  {adAccounts.map((account) => (
                    <label key={account.id} className="asset-item">
                      <input type="checkbox" checked={account.selected} onChange={() => toggleItem(adAccounts, setAdAccounts, account.id)} />
                      <span>
                        <strong>{account.name}</strong>
                        <small>
                          {account.currency || 'N/A'}
                          {account.timezoneName ? ` | ${account.timezoneName}` : ''}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {isConnected && <div className="integration-section">
        <h4>Pixel</h4>
        <p className="page-subtitle">
          El identificador se valida con la conexion OAuth cifrada del servidor. Ningun token se escribe ni se expone en el navegador.
        </p>
        <div className="pixel-form">
          <input
            className="input"
            type="text"
            placeholder="Pixel ID"
            value={pixelId}
            onChange={(e) => {
              setPixelId(e.target.value);
              setPixelValid(null);
            }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => validatePixelMutation.mutate({ pixelId })}
            disabled={!pixelId || !integration?.id || validatePixelMutation.isPending}
          >
            {validatePixelMutation.isPending ? 'Validando...' : 'Validar pixel'}
          </button>
          {pixelValid !== null && (
            <span style={{ color: pixelValid ? '#27ae60' : '#e74c3c', fontWeight: 600 }}>
              {pixelValid ? 'Pixel valido' : 'Pixel invalido'}
            </span>
          )}
        </div>
      </div>}

      {isConnected && <div className="integration-section">
        <h4>Conversions API</h4>
        <p className="page-subtitle">
          Envia un evento aislado con `META_TEST_EVENT_CODE`; no usa datos de prospectos ni altera el flujo comercial.
        </p>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => sendTestEventMutation.mutate()}
          disabled={!pixelValid || !integration?.id || sendTestEventMutation.isPending}
        >
          {sendTestEventMutation.isPending ? 'Enviando...' : 'Enviar evento de prueba'}
        </button>
        {conversionResult && <div className="conversion-result">{conversionResult}</div>}
      </div>}
    </div>
  );
}
