import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { DataTable } from '../../shared/DataTable';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { StatusBadge } from '../../shared/StatusBadge';
import { Modal } from '../../shared/Modal';

interface OnboardingItem {
  [key: string]: unknown;
  id: string;
  clientId: string;
  step: string;
  assignedTo?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

interface ClientOption {
  id: string;
  name: string;
}

interface UserOption {
  id: string;
  name: string;
}

interface OnboardingFormState {
  clientId: string;
  step: string;
  assignedTo: string;
  status: string;
  notes: string;
}

const EMPTY_FORM: OnboardingFormState = {
  clientId: '',
  step: '',
  assignedTo: '',
  status: 'pending',
  notes: '',
};

export function OnboardingPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [templateClientId, setTemplateClientId] = useState('');
  const [form, setForm] = useState<OnboardingFormState>(EMPTY_FORM);

  const { data, isLoading, error } = useQuery({
    queryKey: ['onboarding'],
    queryFn: () => api.get<{ data: OnboardingItem[] }>('/onboarding'),
  });

  const { data: clients } = useQuery<ClientOption[]>({
    queryKey: ['clients'],
    queryFn: () => api.get('/clients'),
  });

  const { data: users } = useQuery<UserOption[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/users'),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/onboarding', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.put(`/onboarding/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/onboarding/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboarding'] }),
  });

  const createTemplateMutation = useMutation({
    mutationFn: (clientId: string) => api.post('/onboarding/templates/standard', { clientId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboarding'] }),
  });

  const items = data?.data ?? [];
  const clientMap = useMemo(() => new Map((clients ?? []).map((client) => [client.id, client.name])), [clients]);
  const userMap = useMemo(() => new Map((users ?? []).map((user) => [user.id, user.name])), [users]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (item: OnboardingItem) => {
    setEditingId(item.id);
    setForm({
      clientId: item.clientId,
      step: item.step,
      assignedTo: item.assignedTo ?? '',
      status: item.status,
      notes: item.notes ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = {
      clientId: form.clientId,
      step: form.step.trim(),
      assignedTo: form.assignedTo || undefined,
      status: form.status,
      notes: form.notes.trim() || undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, body });
      return;
    }

    createMutation.mutate(body);
  };

  if (isLoading) return <LoadingSpinner text="Cargando onboarding..." />;
  if (error) return <div className="alert alert-error">Error al cargar onboarding</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Onboarding</h1>
          <p className="page-subtitle">Checklist operativo alineado al Documento Maestro: brief, estrategia, traspaso y activacion.</p>
        </div>
        <div className="portal-item-actions">
          <select className="input" value={templateClientId} onChange={(e) => setTemplateClientId(e.target.value)}>
            <option value="">Cliente para checklist estandar</option>
            {(clients ?? []).map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          <button
            className="btn btn-outline"
            onClick={() => createTemplateMutation.mutate(templateClientId)}
            disabled={!templateClientId || createTemplateMutation.isPending}
          >
            {createTemplateMutation.isPending ? 'Creando checklist...' : 'Crear checklist estandar'}
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            Nuevo paso
          </button>
        </div>
      </div>
      <DataTable<OnboardingItem>
        keyExtractor={(row) => row.id}
        columns={[
          { key: 'step', label: 'Paso', sortable: true },
          { key: 'clientId', label: 'Cliente', render: (row) => clientMap.get(row.clientId) ?? row.clientId },
          { key: 'assignedTo', label: 'Responsable', render: (row) => row.assignedTo ? userMap.get(row.assignedTo) ?? row.assignedTo : '-' },
          { key: 'status', label: 'Estado', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'createdAt', label: 'Creado', render: (row) => new Date(row.createdAt).toLocaleDateString() },
          {
            key: 'id',
            label: 'Acciones',
            render: (row) => (
              <div className="actions-cell">
                <button className="btn btn-sm btn-outline" onClick={() => openEdit(row)}>
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-outline btn-danger"
                  onClick={() => {
                    if (window.confirm(`Eliminar el paso "${row.step}"?`)) deleteMutation.mutate(row.id);
                  }}
                  disabled={deleteMutation.isPending}
                >
                  Eliminar
                </button>
              </div>
            ),
          },
        ]}
        data={items}
      />

      <Modal open={modalOpen} onClose={closeModal} title={editingId ? 'Editar paso' : 'Nuevo paso de onboarding'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Cliente</label>
            <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required>
              <option value="">Selecciona un cliente</option>
              {(clients ?? []).map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Paso</label>
            <input className="input" value={form.step} onChange={(e) => setForm({ ...form, step: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Responsable</label>
              <select className="input" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Sin asignar</option>
                {(users ?? []).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Notas</label>
            <textarea className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear paso'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
