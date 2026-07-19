import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { StatusBadge } from '../../shared/StatusBadge';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { EmptyState } from '../../shared/EmptyState';
import { LeadDetailDrawer } from './components/LeadDetailDrawer';

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: string;
  source?: string;
  sourceDetail?: string;
  notes?: string;
  campaignName?: string;
  qualityScore: number;
  fitStatus: 'qualified' | 'review' | 'discarded';
  discardReason?: string;
  consentCapturedAt?: string;
  retentionReviewAt?: string;
  metadata?: {
    customDisclaimerResponses?: unknown[];
    scoringSignals?: string[];
  };
  createdAt?: string;
}

const STATUSES = ['new', 'contacted', 'meeting_scheduled', 'quote_sent', 'negotiation', 'won', 'lost'];
const FIT_FILTERS = ['all', 'qualified', 'review', 'discarded'] as const;

export function LeadsPage() {
  const queryClient = useQueryClient();
  const [fitFilter, setFitFilter] = useState<(typeof FIT_FILTERS)[number]>('all');
  const [pageId, setPageId] = useState('');
  const [leadgenId, setLeadgenId] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [dragLeadId, setDragLeadId] = useState<string | null>(null);
  const [dropStatus, setDropStatus] = useState<string | null>(null);

  const { data: leads, isLoading, error } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: () => api.get('/crm/leads'),
  });

  const visibleLeads = useMemo(() => {
    if (!leads) return [];
    if (fitFilter === 'all') return leads;
    return leads.filter((lead) => lead.fitStatus === fitFilter);
  }, [fitFilter, leads]);

  const selectedLead = useMemo(
    () => visibleLeads.find((lead) => lead.id === selectedLeadId) ?? visibleLeads[0] ?? null,
    [selectedLeadId, visibleLeads],
  );

  const grouped = useMemo(
    () =>
      STATUSES.reduce<Record<string, Lead[]>>((acc, status) => {
        acc[status] = visibleLeads.filter((lead) => lead.status === status);
        return acc;
      }, {}),
    [visibleLeads],
  );

  const summary = useMemo(() => {
    const allLeads = leads ?? [];
    return {
      total: allLeads.length,
      qualified: allLeads.filter((lead) => lead.fitStatus === 'qualified').length,
      review: allLeads.filter((lead) => lead.fitStatus === 'review').length,
      discarded: allLeads.filter((lead) => lead.fitStatus === 'discarded').length,
    };
  }, [leads]);

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      status,
      fitStatus,
      discardReason,
    }: {
      id: string;
      status?: string;
      fitStatus?: string;
      discardReason?: string;
    }) => api.put(`/crm/leads/${id}`, { status, fitStatus, discardReason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  const syncLeadMutation = useMutation({
    mutationFn: (payload: { pageId: string; leadgenId: string }) => api.post('/integrations/meta/leads/sync', payload),
    onSuccess: () => {
      setPageId('');
      setLeadgenId('');
      void queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  if (isLoading) return <LoadingSpinner text="Cargando leads..." />;
  if (error) return <div className="alert alert-error">Error al cargar leads</div>;

  return (
    <div className="page">
      <h1>Pipeline comercial</h1>
      <p className="page-subtitle">
        Prioriza leads utiles, revisa origen Meta y saca del flujo los prospectos con poco encaje antes de gastar tiempo comercial.
      </p>

      <div className="card-grid">
        <div className="card">
          <div className="card-title">Leads totales</div>
          <div className="card-value">{summary.total}</div>
        </div>
        <div className="card">
          <div className="card-title">Calificados</div>
          <div className="card-value">{summary.qualified}</div>
        </div>
        <div className="card">
          <div className="card-title">En revision</div>
          <div className="card-value">{summary.review}</div>
        </div>
        <div className="card">
          <div className="card-title">Descartados</div>
          <div className="card-value">{summary.discarded}</div>
        </div>
      </div>

      <div className="filters">
        <select className="input" value={fitFilter} onChange={(e) => setFitFilter(e.target.value as (typeof FIT_FILTERS)[number])}>
          <option value="all">Todos los leads</option>
          <option value="qualified">Solo calificados</option>
          <option value="review">Solo revision</option>
          <option value="discarded">Solo descartados</option>
        </select>
      </div>

      <div className="crm-flow-grid">
        <div className="card crm-sync-card">
          <h3>Sincronizar lead de Meta</h3>
          <p className="page-subtitle">
            Usa `pageId` y `leadgenId` reales para disparar la descarga completa del lead y verificar el flujo de punta a punta.
          </p>
          <div className="modal-form">
            <label>
              Page ID
              <input className="input" value={pageId} onChange={(e) => setPageId(e.target.value)} placeholder="1234567890" />
            </label>
            <label>
              Leadgen ID
              <input className="input" value={leadgenId} onChange={(e) => setLeadgenId(e.target.value)} placeholder="9876543210" />
            </label>
            <button
              className="btn btn-primary"
              onClick={() => syncLeadMutation.mutate({ pageId, leadgenId })}
              disabled={!pageId || !leadgenId || syncLeadMutation.isPending}
            >
              {syncLeadMutation.isPending ? 'Sincronizando...' : 'Sincronizar lead real'}
            </button>
            <p className="page-subtitle">
              Uso controlado para soporte y validacion. Este endpoint opera con limite por minuto y debe usarse solo con IDs reales autorizados.
            </p>
          </div>
        </div>

        <div className="card crm-sync-card">
          <h3>Flujo verificado</h3>
          <div className="status-flow crm-flow-steps">
            <span className="step">Meta Lead Ads</span>
            <span className="arrow">{'->'}</span>
            <span className="step">Webhook leadgen</span>
            <span className="arrow">{'->'}</span>
            <span className="step">Descarga detalle</span>
            <span className="arrow">{'->'}</span>
            <span className="step">Score y filtro</span>
            <span className="arrow">{'->'}</span>
            <span className="step">Contacto</span>
            <span className="arrow">{'->'}</span>
            <span className="step">Oportunidad</span>
          </div>
          <p className="crm-flow-note">
            Los leads utiles crean base comercial minima automaticamente. Los no utiles quedan descartados con motivo para no contaminar el pipeline.
          </p>
        </div>
      </div>

      <div className="card crm-sync-card">
        <h3>Control de cumplimiento</h3>
        <div className="portal-list">
          <div className="crm-related-item">
            <strong>Consentimiento y origen</strong>
            <span>Cada lead debe conservar trazabilidad de formulario, pagina y fecha de captura.</span>
          </div>
          <div className="crm-related-item">
            <strong>Eliminacion y anonimizado</strong>
            <span>Las acciones manuales del CRM deben usar exportacion o anonimizado, no borrado silencioso.</span>
          </div>
          <div className="crm-related-item">
            <strong>Retencion operativa</strong>
            <span>Los leads descartados deben revisarse por fecha de retencion antes de seguir usando sus datos.</span>
          </div>
        </div>
      </div>

      {visibleLeads.length === 0 ? (
        <EmptyState
          icon="[]"
          title="Sin leads en este filtro"
          description="Ajusta el filtro o conecta Meta Lead Ads para empezar a poblar el pipeline con prospectos reales."
        />
      ) : (
        <>
          <div className="crm-board-toolbar">
            <div className="crm-board-legend">
              <span className="crm-legend-chip"><span className="crm-legend-dot is-qualified" /> Util comercial</span>
              <span className="crm-legend-chip"><span className="crm-legend-dot is-review" /> Revision manual</span>
              <span className="crm-legend-chip"><span className="crm-legend-dot is-discarded" /> Descartado</span>
            </div>
            <span className="page-subtitle">Arrastra tarjetas entre columnas para mover el pipeline con un flujo mas claro y consistente.</span>
          </div>
          <div className="kanban">
            {STATUSES.map((status) => (
              <div
                key={status}
                className={`kanban-column ${dropStatus === status ? 'is-drop-target' : ''}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropStatus(status);
                }}
                onDragLeave={() => {
                  if (dropStatus === status) setDropStatus(null);
                }}
                onDrop={() => {
                  if (!dragLeadId) return;
                  setDropStatus(null);
                  setDragLeadId(null);
                  updateMutation.mutate({ id: dragLeadId, status });
                }}
              >
                <div className="kanban-header">
                  <StatusBadge status={status} />
                  <span className="kanban-count">{grouped[status]?.length ?? 0}</span>
                </div>

                <div className="kanban-cards">
                  {(grouped[status] ?? []).map((lead) => (
                    <div
                      key={lead.id}
                      role="button"
                      tabIndex={0}
                      draggable
                      data-fit-status={lead.fitStatus}
                      className={`kanban-card lead-card ${selectedLead?.id === lead.id ? 'lead-card-selected' : ''} ${dragLeadId === lead.id ? 'is-dragging' : ''}`}
                      onClick={() => setSelectedLeadId(lead.id)}
                      onDragStart={() => {
                        setDragLeadId(lead.id);
                        setSelectedLeadId(lead.id);
                      }}
                      onDragEnd={() => {
                        setDragLeadId(null);
                        setDropStatus(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setSelectedLeadId(lead.id);
                        }
                      }}
                    >
                      <div className="kanban-card-title">{lead.name}</div>
                      <div className="lead-card-meta">
                        <StatusBadge status={lead.fitStatus} />
                        <span className={`lead-score ${lead.qualityScore >= 70 ? 'lead-score-good' : lead.qualityScore >= 35 ? 'lead-score-mid' : 'lead-score-bad'}`}>
                          Score {lead.qualityScore}
                        </span>
                      </div>
                      <div className="kanban-card-info">{lead.company || 'Sin empresa informada'}</div>
                      <div className="kanban-card-info">{lead.email || lead.phone || 'Sin canal de contacto'}</div>
                      <div className="kanban-card-info">{lead.sourceDetail || lead.source || 'Origen no informado'}</div>
                      {lead.campaignName && <div className="kanban-card-info">Campana: {lead.campaignName}</div>}
                      {lead.createdAt && <div className="kanban-card-info">Ingreso: {new Date(lead.createdAt).toLocaleString()}</div>}
                      {lead.consentCapturedAt && <div className="kanban-card-info">Consentimiento: {new Date(lead.consentCapturedAt).toLocaleString()}</div>}
                      {lead.discardReason && <div className="lead-discard-reason">{lead.discardReason}</div>}
                      {lead.notes && <div className="lead-note-preview">{lead.notes.split('\n')[0]}</div>}

                      <div className="kanban-card-actions">
                        {STATUSES.indexOf(status) > 0 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={(event) => {
                              event.stopPropagation();
                              updateMutation.mutate({ id: lead.id, status: STATUSES[STATUSES.indexOf(status) - 1] });
                            }}
                          >
                            Anterior
                          </button>
                        )}
                        {STATUSES.indexOf(status) < STATUSES.length - 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={(event) => {
                              event.stopPropagation();
                              updateMutation.mutate({ id: lead.id, status: STATUSES[STATUSES.indexOf(status) + 1] });
                            }}
                          >
                            Siguiente
                          </button>
                        )}
                      </div>

                      <div className="kanban-card-actions">
                        {lead.fitStatus !== 'qualified' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={(event) => {
                              event.stopPropagation();
                              updateMutation.mutate({ id: lead.id, fitStatus: 'qualified', discardReason: '' });
                            }}
                          >
                            Marcar util
                          </button>
                        )}
                        {lead.fitStatus !== 'review' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={(event) => {
                              event.stopPropagation();
                              updateMutation.mutate({ id: lead.id, fitStatus: 'review', discardReason: '' });
                            }}
                          >
                            En revision
                          </button>
                        )}
                        {lead.fitStatus !== 'discarded' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline btn-danger"
                            onClick={(event) => {
                              event.stopPropagation();
                              updateMutation.mutate({
                                id: lead.id,
                                fitStatus: 'discarded',
                                discardReason: lead.discardReason || 'Descartado por revision comercial.',
                                status: status === 'won' ? status : 'lost',
                              });
                            }}
                          >
                            Descartar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <LeadDetailDrawer leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />
        </>
      )}

      <div className="status-diagram">
        <h3>Flujo operativo</h3>
        <div className="status-flow">
          <span className="step">Nuevo</span><span className="arrow">{'->'}</span>
          <span className="step">Contactado</span><span className="arrow">{'->'}</span>
          <span className="step">Reunion agendada</span><span className="arrow">{'->'}</span>
          <span className="step">Presupuesto enviado</span><span className="arrow">{'->'}</span>
          <span className="step">Negociacion</span><span className="arrow">{'->'}</span>
          <span className="step">Ganado</span>
          <span className="arrow">/</span>
          <span className="step lost">Perdido</span>
        </div>
      </div>
    </div>
  );
}
