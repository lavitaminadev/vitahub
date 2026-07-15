import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { StatusBadge } from '../../shared/StatusBadge';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { Modal } from '../../shared/Modal';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  participants: string[];
  notes: string;
  status: string;
}

export function MeetingsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', time: '', duration: 30, notes: '' });
  const queryClient = useQueryClient();

  const { data: meetings, isLoading, error } = useQuery<Meeting[]>({
    queryKey: ['meetings'],
    queryFn: () => api.get('/meetings'),
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof form) => api.post('/meetings', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setModalOpen(false);
      setForm({ title: '', date: '', time: '', duration: 30, notes: '' });
    },
  });

  if (isLoading) return <LoadingSpinner text="Cargando reuniones..." />;
  if (error) return <div className="alert alert-error">Error al cargar reuniones</div>;

  const sorted = [...(meetings ?? [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="page">
      <div className="page-header">
        <h1>Reuniones</h1>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Nueva Reunión</button>
      </div>
      {sorted.length === 0 ? (
        <div className="alert alert-info">No hay reuniones programadas</div>
      ) : (
        <div className="meeting-list">
          {sorted.map((m) => (
            <div key={m.id} className="meeting-card">
              <div className="meeting-date">
                <div className="meeting-day">{new Date(m.date).getDate()}</div>
                <div className="meeting-month">{new Date(m.date).toLocaleString('es', { month: 'short' })}</div>
              </div>
              <div className="meeting-info">
                <div className="meeting-title">{m.title}</div>
                <div className="meeting-meta">{m.time} · {m.duration}min</div>
                {m.participants?.length > 0 && (
                  <div className="meeting-participants">{m.participants.join(', ')}</div>
                )}
                {m.notes && <div className="meeting-notes">{m.notes}</div>}
              </div>
              <StatusBadge status={m.status} />
            </div>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Reunión">
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}>
          <div className="form-group">
            <label>Título</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
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
            <div className="form-group">
              <label>Duración (min)</label>
              <input className="input" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
            </div>
          </div>
          <div className="form-group">
            <label>Notas</label>
            <textarea className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creando...' : 'Crear Reunión'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
