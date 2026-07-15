import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { DataTable } from '../../shared/DataTable';
import { StatusBadge } from '../../shared/StatusBadge';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { Modal } from '../../shared/Modal';

interface Client {
  id: string;
  name: string;
  email: string;
  industry: string;
  status: string;
  defaultUdBudget: number;
  createdAt: string;
}

export function ClientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', industry: '', defaultUdBudget: 0 });
  const queryClient = useQueryClient();

  const { data: clients, isLoading, error } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => api.get('/clients'),
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof form) => api.post('/clients', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setModalOpen(false);
      setForm({ name: '', email: '', industry: '', defaultUdBudget: 0 });
    },
  });

  const filtered = (clients ?? []).filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isLoading) return <LoadingSpinner text="Cargando clientes..." />;
  if (error) return <div className="alert alert-error">Error al cargar clientes</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Clientes</h1>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Nuevo Cliente</button>
      </div>
      <div className="filters">
        <input className="input" placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="pending">Pendiente</option>
        </select>
      </div>
      <DataTable
        columns={[
          { key: 'name', label: 'Nombre', sortable: true },
          { key: 'email', label: 'Email', sortable: true },
          { key: 'industry', label: 'Industria', sortable: true },
          { key: 'status', label: 'Estado', render: (r) => <StatusBadge status={r.status as string} /> },
          { key: 'defaultUdBudget', label: 'Presupuesto UD', sortable: true, render: (r) => String(r.defaultUdBudget ?? 0) },
        ]}
        data={filtered as unknown as Record<string, unknown>[]}
        keyExtractor={(r) => r.id as string}
        emptyMessage="No se encontraron clientes"
      />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Cliente">
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}>
          <div className="form-group">
            <label>Nombre</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Industria</label>
            <input className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Presupuesto UD</label>
            <input className="input" type="number" value={form.defaultUdBudget} onChange={(e) => setForm({ ...form, defaultUdBudget: Number(e.target.value) })} />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creando...' : 'Crear Cliente'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
