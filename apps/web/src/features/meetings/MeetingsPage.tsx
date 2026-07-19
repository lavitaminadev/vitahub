import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { StatusBadge } from '../../shared/StatusBadge';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { Modal } from '../../shared/Modal';

interface ActionItem {
  id: string;
  description: string;
  status: string;
  dueAt?: string;
}

interface Meeting {
  id: string;
  title: string;
  type: string;
  status: string;
  scheduledAt: string;
  durationMinutes?: number;
  clientId?: string;
  location?: string;
  meetingLink?: string;
  minutes?: string;
  actionItems?: ActionItem[];
}

interface ClientOption {
  id: string;
  name: string;
}

interface MeetingFormState {
  clientId: string;
  title: string;
  type: string;
  date: string;
  time: string;
  durationMinutes: string;
  location: string;
  meetingLink: string;
}

const EMPTY_FORM: MeetingFormState = {
  clientId: '',
  title: '',
  type: 'weekly',
  date: '',
  time: '',
  durationMinutes: '30',
  location: '',
  meetingLink: '',
};

export function MeetingsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<MeetingFormState>(EMPTY_FORM);
  const [actionItemDrafts, setActionItemDrafts] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { data: meetings, isLoading, error } = useQuery<Meeting[]>({
    queryKey: ['meetings'],
    queryFn: () => api.get('/meetings'),
  });

  const { data: clients } = useQuery<ClientOption[]>({
    queryKey: ['clients'],
    queryFn: () => api.get('/clients'),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/meetings', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setModalOpen(false);
      setForm(EMPTY_FORM);
    },
  });

  const createActionItemMutation = useMutation({
    mutationFn: ({ meetingId, description }: { meetingId: string; description: string }) =>
      api.post(`/meetings/${meetingId}/action-items`, { description }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meetings'] }),
  });

  const clientMap = useMemo(
    () => new Map((clients ?? []).map((client) => [client.id, client.name])),
    [clients],
  );

  if (isLoading) return <LoadingSpinner text="Cargando reuniones..." />;
  if (error) return <div className="alert alert-error">Error al cargar reuniones</div>;

  const sorted = [...(meetings ?? [])].sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const scheduledAt = form.date && form.time ? new Date(`${form.date}T${form.time}`).toISOString() : undefined;
    createMutation.mutate({
      clientId: form.clientId || undefined,
      title: form.title.trim(),
      type: form.type,
      scheduledAt,
      durationMinutes: Number(form.durationMinutes),
      location: form.location.trim() || undefined,
      meetingLink: form.meetingLink.trim() || undefined,
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Reuniones</h1>
          <p className="page-subtitle">Registro operativo de reuniones y compromisos asociados para seguimiento semanal y estrategico.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Nueva Reunion
        </button>
      </div>
      {sorted.length === 0 ? (
        <div className="alert alert-info">No hay reuniones programadas</div>
      ) : (
        <div className="meeting-list">
          {sorted.map((meeting) => {
            const scheduledAt = new Date(meeting.scheduledAt);
            return (
              <div key={meeting.id} className="meeting-card">
                <div className="meeting-date">
                  <div className="meeting-day">{scheduledAt.getDate()}</div>
                  <div className="meeting-month">{scheduledAt.toLocaleString('es', { month: 'short' })}</div>
                </div>
                <div className="meeting-info">
                  <div className="meeting-title">{meeting.title}</div>
                  <div className="meeting-meta">
                    {scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {meeting.durationMinutes ?? 60} min · {meeting.type}
                  </div>
                  {meeting.clientId && (
                    <div className="meeting-participants">Cliente: {clientMap.get(meeting.clientId) ?? meeting.clientId}</div>
                  )}
                  {meeting.location && <div className="meeting-meta">Lugar: {meeting.location}</div>}
                  {meeting.meetingLink && (
                    <div className="meeting-participants">
                      <a href={meeting.meetingLink} target="_blank" rel="noreferrer">
                        Abrir enlace
                      </a>
                    </div>
                  )}
                  {meeting.minutes && <div className="meeting-notes">{meeting.minutes}</div>}
                  <div className="portal-item-actions" style={{ marginTop: '8px' }}>
                    <input
                      className="input"
                      placeholder="Nuevo compromiso o accion"
                      value={actionItemDrafts[meeting.id] || ''}
                      onChange={(e) => setActionItemDrafts((current) => ({ ...current, [meeting.id]: e.target.value }))}
                    />
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        const description = actionItemDrafts[meeting.id]?.trim();
                        if (!description) return;
                        createActionItemMutation.mutate({ meetingId: meeting.id, description });
                        setActionItemDrafts((current) => ({ ...current, [meeting.id]: '' }));
                      }}
                    >
                      Agregar accion
                    </button>
                  </div>
                  {(meeting.actionItems?.length ?? 0) > 0 && (
                    <div className="portal-list" style={{ marginTop: '10px' }}>
                      {meeting.actionItems?.map((item) => (
                        <div key={item.id} className="crm-related-item">
                          <strong>{item.description}</strong>
                          <span>{item.status}</span>
                          <span>{item.dueAt ? new Date(item.dueAt).toLocaleDateString() : 'Sin vencimiento'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <StatusBadge status={meeting.status} />
              </div>
            );
          })}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Reunion">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Cliente</label>
            <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
              <option value="">Sin cliente</option>
              {(clients ?? []).map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Titulo</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Tipo</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="weekly">Weekly</option>
                <option value="strategic">Strategic</option>
              </select>
            </div>
            <div className="form-group">
              <label>Duracion (min)</label>
              <input className="input" type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fecha</label>
              <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Hora</label>
              <input className="input" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Ubicacion</label>
            <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Link</label>
            <input className="input" type="url" value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creando...' : 'Crear Reunion'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
