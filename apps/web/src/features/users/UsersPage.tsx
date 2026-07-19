import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { DataTable } from '../../shared/DataTable';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { StatusBadge } from '../../shared/StatusBadge';
import { Modal } from '../../shared/Modal';

interface UserRow {
  [key: string]: unknown;
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  phone?: string;
  clientId?: string;
  createdAt: string;
}

interface ClientOption {
  id: string;
  name: string;
  status: string;
}

interface UserFormState {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  clientId: string;
}

const EMPTY_FORM: UserFormState = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'designer',
  clientId: '',
};

const USER_ROLES = [
  'admin',
  'commercial_director',
  'creative_director',
  'operations_director',
  'art_director',
  'av_director',
  'ai_lead',
  'community_manager',
  'designer',
  'audiovisual',
  'client',
] as const;

export function UsersPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (roleFilter) params.set('role', roleFilter);
    if (statusFilter) params.set('isActive', statusFilter);
    if (clientFilter) params.set('clientId', clientFilter);
    return params.toString();
  }, [clientFilter, roleFilter, search, statusFilter]);

  const { data, isLoading, error } = useQuery<UserRow[]>({
    queryKey: ['users', query],
    queryFn: () => api.get(`/users${query ? `?${query}` : ''}`),
  });

  const { data: clients = [] } = useQuery<ClientOption[]>({
    queryKey: ['clients'],
    queryFn: () => api.get('/clients'),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/users', body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      setModalOpen(false);
      setForm(EMPTY_FORM);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/users/${id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const users = Array.isArray(data) ? data : [];
  const clientMap = useMemo(() => new Map(clients.map((client) => [client.id, client.name])), [clients]);

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const closeCreateModal = () => {
    setModalOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      phone: form.phone.trim() || undefined,
      role: form.role,
      clientId: form.role === 'client' ? form.clientId || undefined : undefined,
    });
  };

  if (isLoading) return <LoadingSpinner text="Cargando usuarios..." />;
  if (error) return <div className="alert alert-error">Error al cargar usuarios</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Usuarios y accesos</h1>
          <p className="page-subtitle">
            El admin crea cuentas internas o portal cliente, asigna empresa y controla qu&eacute; vista puede usar cada persona.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Crear cuenta
        </button>
      </div>

      <div className="filters">
        <input className="input" placeholder="Buscar por nombre, email o rol..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Todos los roles</option>
          {USER_ROLES.map((role) => (
            <option key={role} value={role}>
              {role.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Activos e inactivos</option>
          <option value="true">Solo activos</option>
          <option value="false">Solo inactivos</option>
        </select>
        <select className="input" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
          <option value="">Todas las empresas</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <DataTable<UserRow>
        keyExtractor={(row) => row.id}
        columns={[
          { key: 'name', label: 'Nombre', sortable: true },
          { key: 'email', label: 'Email', sortable: true },
          { key: 'role', label: 'Rol', render: (row) => <StatusBadge status={row.role} /> },
          {
            key: 'clientId',
            label: 'Empresa asignada',
            render: (row) => row.clientId ? clientMap.get(row.clientId) ?? row.clientId : 'Equipo interno',
          },
          { key: 'phone', label: 'Teléfono', render: (row) => row.phone || '-' },
          {
            key: 'isActive',
            label: 'Acceso',
            render: (row) => (
              <button
                type="button"
                className={`btn btn-sm ${row.isActive ? 'btn-outline' : 'btn-primary'}`}
                onClick={() => updateMutation.mutate({ id: row.id, body: { isActive: !row.isActive } })}
              >
                {row.isActive ? 'Activo' : 'Inactivo'}
              </button>
            ),
          },
          {
            key: 'createdAt',
            label: 'Creado',
            sortable: true,
            render: (row) => new Date(row.createdAt).toLocaleDateString(),
          },
          {
            key: 'id',
            label: 'Administrar',
            render: (row) => (
              <div className="table-actions-inline">
                <select
                  className="input input-compact"
                  aria-label={`Rol de ${row.name}`}
                  value={row.role}
                  onChange={(e) => updateMutation.mutate({ id: row.id, body: { role: e.target.value } })}
                >
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <select
                  className="input input-compact"
                  aria-label={`Empresa de ${row.name}`}
                  value={row.clientId || ''}
                  onChange={(e) =>
                    updateMutation.mutate({
                      id: row.id,
                      body: { clientId: e.target.value || null, role: row.role === 'client' ? row.role : 'client' },
                    })
                  }
                >
                  <option value="">Sin empresa</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            ),
          },
        ]}
        data={users}
        emptyMessage="No hay usuarios para este filtro"
      />

      <Modal open={modalOpen} onClose={closeCreateModal} title="Crear cuenta">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Rol</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, clientId: e.target.value === 'client' ? form.clientId : '' })}>
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Empresa</label>
              <select
                className="input"
                value={form.clientId}
                disabled={form.role !== 'client'}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              >
                <option value="">Sin asignar</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Contraseña inicial</label>
            <input className="input" type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creando...' : 'Crear usuario'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
