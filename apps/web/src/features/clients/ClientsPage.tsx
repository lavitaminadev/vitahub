import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { DataTable } from '../../shared/DataTable';
import { StatusBadge } from '../../shared/StatusBadge';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { Modal } from '../../shared/Modal';

interface ClientRecord {
  [key: string]: unknown;
  id: string;
  name: string;
  legalName?: string;
  industry?: string;
  status: string;
  retainerAmount?: number;
  currency?: string;
  defaultUdBudget: number;
  communityManagerId?: string;
  createdAt: string;
}

interface UserOption {
  id: string;
  name: string;
  role: string;
}

interface ClientFormState {
  name: string;
  legalName: string;
  industry: string;
  communityManagerId: string;
  retainerAmount: string;
  currency: string;
  defaultUdBudget: string;
}

const EMPTY_FORM: ClientFormState = {
  name: '',
  legalName: '',
  industry: '',
  communityManagerId: '',
  retainerAmount: '',
  currency: 'CLP',
  defaultUdBudget: '20',
};

export function ClientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ClientFormState>(EMPTY_FORM);
  const queryClient = useQueryClient();

  const { data: clients, isLoading, error } = useQuery<ClientRecord[]>({
    queryKey: ['clients'],
    queryFn: () => api.get('/clients'),
  });

  const { data: users } = useQuery<UserOption[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/users'),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/clients', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setModalOpen(false);
      setForm(EMPTY_FORM);
    },
    onError: (err) => console.error(err),
  });

  const managerMap = useMemo(
    () => new Map((users ?? []).map((user) => [user.id, user.name])),
    [users],
  );

  const managerOptions = useMemo(
    () => (users ?? []).filter((user) => ['community_manager', 'admin', 'operations_director'].includes(user.role)),
    [users],
  );

  const filtered = (clients ?? []).filter((client) => {
    const term = search.toLowerCase();
    const matchSearch =
      !search ||
      client.name.toLowerCase().includes(term) ||
      (client.legalName ?? '').toLowerCase().includes(term) ||
      (client.industry ?? '').toLowerCase().includes(term);
    const matchStatus = !statusFilter || client.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate({
      name: form.name.trim(),
      legalName: form.legalName.trim() || undefined,
      industry: form.industry.trim() || undefined,
      communityManagerId: form.communityManagerId || undefined,
      retainerAmount: form.retainerAmount ? Number(form.retainerAmount) : undefined,
      currency: form.currency.trim() || undefined,
      defaultUdBudget: Number(form.defaultUdBudget),
    });
  };

  if (isLoading) return <LoadingSpinner text="Cargando clientes..." />;
  if (error) return <div className="alert alert-error">Error al cargar clientes</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Clientes</h1>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Nuevo Cliente
        </button>
      </div>
      <div className="filters">
        <input className="input" placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="onboarding">Onboarding</option>
          <option value="paused">Pausado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>
      <DataTable<ClientRecord>
        columns={[
          { key: 'name', label: 'Nombre', sortable: true },
          { key: 'legalName', label: 'Razón social', sortable: true, render: (row) => row.legalName || '-' },
          { key: 'industry', label: 'Industria', sortable: true, render: (row) => row.industry || '-' },
          { key: 'status', label: 'Estado', render: (row) => <StatusBadge status={row.status} /> },
          {
            key: 'retainerAmount',
            label: 'Retainer',
            render: (row) => row.retainerAmount ? `${row.currency || 'CLP'} ${Number(row.retainerAmount).toLocaleString()}` : '-',
          },
          { key: 'defaultUdBudget', label: 'Presupuesto UD', sortable: true, render: (row) => String(row.defaultUdBudget ?? 0) },
          {
            key: 'communityManagerId',
            label: 'Responsable',
            render: (row) => row.communityManagerId ? managerMap.get(row.communityManagerId) ?? row.communityManagerId : '-',
          },
        ]}
        data={filtered}
        keyExtractor={(row) => row.id}
        emptyMessage="No se encontraron clientes"
      />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Cliente">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre comercial</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Razón social</label>
            <input className="input" value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Industria</label>
            <input className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Responsable</label>
              <select className="input" value={form.communityManagerId} onChange={(e) => setForm({ ...form, communityManagerId: e.target.value })}>
                <option value="">Sin asignar</option>
                {managerOptions.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Moneda</label>
              <input className="input" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Retainer</label>
              <input className="input" type="number" min="0" value={form.retainerAmount} onChange={(e) => setForm({ ...form, retainerAmount: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Presupuesto UD</label>
              <input className="input" type="number" min="0" value={form.defaultUdBudget} onChange={(e) => setForm({ ...form, defaultUdBudget: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creando...' : 'Crear Cliente'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
