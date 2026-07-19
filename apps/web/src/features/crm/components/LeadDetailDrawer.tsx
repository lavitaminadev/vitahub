import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../core/api';
import { StatusBadge } from '../../../shared/StatusBadge';

interface LeadDetail {
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
}

interface LeadDetailDrawerProps {
  leadId: string | null;
  onClose: () => void;
}

export function LeadDetailDrawer({ leadId, onClose }: LeadDetailDrawerProps) {
  const queryClient = useQueryClient();

  const { data: lead, isLoading } = useQuery<LeadDetail>({
    queryKey: ['lead', leadId],
    queryFn: () => api.get(`/crm/leads/${leadId}`),
    enabled: Boolean(leadId),
  });

  const exportLeadMutation = useMutation({
    mutationFn: (id: string) => api.get(`/data-protection/leads/${id}/export`),
  });

  const anonymizeLeadMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/data-protection/leads/${id}/anonymize`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      onClose();
    },
  });

  if (!leadId) return null;

  return (
    <>
      <div className={`drawer-backdrop ${leadId ? 'is-open' : ''}`} onClick={onClose} />
      <div className={`drawer-panel ${leadId ? 'is-open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <h3>{isLoading ? 'Cargando...' : lead?.name}</h3>
            {!isLoading && lead && (
              <div className="drawer-badges">
                <StatusBadge status={lead.status} />
                <StatusBadge status={lead.fitStatus} />
              </div>
            )}
          </div>
          <button className="drawer-close" onClick={onClose}>&times;</button>
        </div>

        <div className="drawer-content">
          {isLoading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : lead ? (
            <div className="drawer-sections">
              
              <div className="drawer-section">
                <h4>Información Principal</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Empresa</span>
                    <span className="detail-value">{lead.company || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{lead.email || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Teléfono</span>
                    <span className="detail-value">{lead.phone || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Origen</span>
                    <span className="detail-value">{lead.sourceDetail || lead.source || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="drawer-section">
                <h4>Métricas y Privacidad</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Score (Calidad)</span>
                    <span className="detail-value">
                      <span className={`lead-score ${lead.qualityScore >= 70 ? 'lead-score-good' : lead.qualityScore >= 35 ? 'lead-score-mid' : 'lead-score-bad'}`}>
                        {lead.qualityScore} / 100
                      </span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Campaña Meta</span>
                    <span className="detail-value">{lead.campaignName || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Consentimiento (Opt-in)</span>
                    <span className="detail-value">
                      {lead.consentCapturedAt ? new Date(lead.consentCapturedAt).toLocaleString() : 'No registrado'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Revisión Retención</span>
                    <span className="detail-value">
                      {lead.retentionReviewAt ? new Date(lead.retentionReviewAt).toLocaleDateString() : 'Sin fecha'}
                    </span>
                  </div>
                </div>
              </div>

              {lead.notes && (
                <div className="drawer-section">
                  <h4>Notas (Meta / Adicionales)</h4>
                  <div className="lead-note-full">{lead.notes}</div>
                </div>
              )}

              {lead.discardReason && (
                <div className="drawer-section">
                  <h4>Motivo de Descarte</h4>
                  <div className="lead-discard-reason">{lead.discardReason}</div>
                </div>
              )}

              <div className="drawer-section">
                <h4>Acciones de Privacidad</h4>
                <div className="drawer-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => exportLeadMutation.mutate(lead.id)}
                    disabled={exportLeadMutation.isPending}
                  >
                    {exportLeadMutation.isPending ? 'Exportando...' : 'Descargar Datos (Export)'}
                  </button>
                  <button
                    className="btn btn-outline btn-sm btn-danger"
                    onClick={() => {
                      if (window.confirm('¿Anonimizar este lead? Esta acción no se puede deshacer y borra los PII.')) {
                        anonymizeLeadMutation.mutate(lead.id);
                      }
                    }}
                    disabled={anonymizeLeadMutation.isPending}
                  >
                    {anonymizeLeadMutation.isPending ? 'Anonimizando...' : 'Anonimizar (Derecho al Olvido)'}
                  </button>
                </div>
                {exportLeadMutation.isSuccess && <div className="alert alert-success" style={{marginTop: '10px'}}>Exportación iniciada con éxito.</div>}
              </div>

            </div>
          ) : (
            <div className="alert alert-error">Error al cargar el prospecto.</div>
          )}
        </div>
      </div>
    </>
  );
}
