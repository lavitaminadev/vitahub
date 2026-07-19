import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { DataTable } from '../../shared/DataTable';
import { StatusBadge } from '../../shared/StatusBadge';
import { Modal } from '../../shared/Modal';

interface Service {
  id: string;
  name: string;
  category: string;
  description?: string;
  unitPrice?: number;
  currency: string;
  udPerUnit: number;
  status: string;
}

interface ServiceForm {
  name: string;
  category: string;
  description: string;
  unitPrice: string;
  currency: string;
  udPerUnit: string;
}

const EMPTY_FORM: ServiceForm = { name: '', category: '', description: '', unitPrice: '', currency: 'CLP', udPerUnit: '0' };

export function CatalogServicesTab() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);

  const { data, isLoading } = useQuery({ queryKey: ['catalog-services'], queryFn: () => api.get('/catalog/services') });
  const services: Service[] = Array.isArray(data) ? data : [];

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/catalog/services', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-services'] });
      setModalOpen(false);
      setForm(EMPTY_FORM);
    },
    onError: (err) => console.error(err),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.put(`/catalog/services/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-services'] });
      setModalOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
    onError: (err) => console.error(err),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      name: form.name,
      category: form.category,
      description: form.description || undefined,
      unitPrice: form.unitPrice ? Number(form.unitPrice) : undefined,
      currency: form.currency,
      udPerUnit: Number(form.udPerUnit),
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, body });
    } else {
      createMutation.mutate(body);
    }
  };

  const openEdit = (svc: Service) => {
    setEditingId(svc.id);
    setForm({
      name: svc.name,
      category: svc.category,
      description: svc.description || '',
      unitPrice: svc.unitPrice?.toString() || '',
      currency: svc.currency,
      udPerUnit: svc.udPerUnit.toString(),
    });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  return (
    <div>
      <div className="section-header">
        <button className="btn btn-primary" onClick={openCreate}>Nuevo Servicio</button>
      </div>
      <DataTable
        keyExtractor={(r) => r.id as string}
        columns={[
          { key: 'name', label: 'Servicio', sortable: true },
          { key: 'category', label: 'Categoría' },
          { key: 'unitPrice', label: 'Precio Unitario', render: (r) => r.unitPrice ? `$${Number(r.unitPrice).toLocaleString()}` : '-' },
          { key: 'udPerUnit', label: 'UD por Unidad', render: (r) => Number(r.udPerUnit).toString() },
          { key: 'status', label: 'Estado', render: (r) => <StatusBadge status={r.status as string} /> },
          {
            key: 'actions', label: 'Acciones',
            render: (r) => <button className="btn btn-sm btn-outline" onClick={() => openEdit(r)}>Editar</button>,
          },
        ]}
        data={services as any[]}
        loading={isLoading}
      />

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null); setForm(EMPTY_FORM); }}
        title={editingId ? 'Editar Servicio' : 'Nuevo Servicio'}>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>Nombre <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Categoría
            <select className="input" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Selecciona una categoría</option>
              <option value="monthly">Monthly</option>
              <option value="ads">Ads</option>
              <option value="project">Project</option>
              <option value="one_time">One time</option>
            </select>
          </label>
          <label>Descripción <textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label>Precio Unitario <input className="input" type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} /></label>
          <label>Moneda <input className="input" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} /></label>
          <label>UD por Unidad <input className="input" type="number" required value={form.udPerUnit} onChange={(e) => setForm({ ...form, udPerUnit: e.target.value })} /></label>
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? (editingId ? 'Guardando...' : 'Creando...') : (editingId ? 'Guardar' : 'Crear')}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => { setModalOpen(false); setEditingId(null); setForm(EMPTY_FORM); }}>Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
