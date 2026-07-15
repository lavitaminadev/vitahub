import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { StatusBadge } from '../../shared/StatusBadge';
import { LoadingSpinner } from '../../shared/LoadingSpinner';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  source: string;
  notes: string;
}

const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost'];

export function LeadsPage() {
  const queryClient = useQueryClient();
  const { data: leads, isLoading, error } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: () => api.get('/crm/leads'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/crm/leads/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  if (isLoading) return <LoadingSpinner text="Cargando leads..." />;
  if (error) return <div className="alert alert-error">Error al cargar leads</div>;

  const grouped = STATUSES.reduce<Record<string, Lead[]>>((acc, s) => {
    acc[s] = (leads ?? []).filter((l) => l.status === s);
    return acc;
  }, {});

  return (
    <div className="page">
      <h1>Pipeline de Leads</h1>
      {(leads?.length ?? 0) === 0 ? (
        <div className="alert alert-info">No hay leads registrados</div>
      ) : (
        <div className="kanban">
          {STATUSES.map((status) => (
            <div key={status} className="kanban-column">
              <div className="kanban-header">
                <StatusBadge status={status} />
                <span className="kanban-count">{grouped[status]?.length ?? 0}</span>
              </div>
              <div className="kanban-cards">
                {(grouped[status] ?? []).map((lead) => (
                  <div key={lead.id} className="kanban-card">
                    <div className="kanban-card-title">{lead.name}</div>
                    <div className="kanban-card-info">{lead.company}</div>
                    <div className="kanban-card-info">{lead.email}</div>
                    <div className="kanban-card-actions">
                      {STATUSES.indexOf(status) > 0 && (
                        <button className="btn btn-sm btn-outline" onClick={() => updateMutation.mutate({ id: lead.id, status: STATUSES[STATUSES.indexOf(status) - 1] })}>◀</button>
                      )}
                      {STATUSES.indexOf(status) < STATUSES.length - 1 && (
                        <button className="btn btn-sm btn-outline" onClick={() => updateMutation.mutate({ id: lead.id, status: STATUSES[STATUSES.indexOf(status) + 1] })}>▶</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
