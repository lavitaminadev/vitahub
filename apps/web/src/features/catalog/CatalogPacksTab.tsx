import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { DataTable } from '../../shared/DataTable';
import { StatusBadge } from '../../shared/StatusBadge';
import { Modal } from '../../shared/Modal';

interface Pack {
  id: string;
  name: string;
  description?: string;
  monthlyUd: number;
  reelsIncluded: number;
  monthlyPrice?: number;
  currency: string;
  services?: string;
  status: string;
  createdAt: string;
}

interface PackForm {
  name: string;
  description: string;
  monthlyUd: string;
  reelsIncluded: string;
  monthlyPrice: string;
  currency: string;
  services: string;
}

const EMPTY_FORM: PackForm = { name: '', description: '', monthlyUd: '0', reelsIncluded: '0', monthlyPrice: '', currency: 'CLP', services: '' };

export function CatalogPacksTab() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<PackForm>(EMPTY_FORM);

  const { data } = useQuery({ queryKey: ['catalog-packs'], queryFn: () => api.get('/catalog/packs') });
  const packs: Pack[] = Array.isArray(data) ? data : [];

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/catalog/packs', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['catalog-packs'] }); setModalOpen(false); setForm(EMPTY_FORM); },
    onError: (err) => console.error(err),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body: Record<string, unknown> = {
      name: form.name,
      description: form.description || undefined,
      monthlyUd: Number(form.monthlyUd),
      reelsIncluded: Number(form.reelsIncluded),
      monthlyPrice: form.monthlyPrice ? Number(form.monthlyPrice) : undefined,
      currency: form.currency,
      services: form.services || undefined,
    };
    createMutation.mutate(body);
  };

  return (
    <div>
      <div className="section-header">
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setModalOpen(true); }}>Nuevo Pack</button>
      </div>
      <DataTable
        keyExtractor={(r) => r.id as string}
        columns={[
          { key: 'name', label: 'Pack', sortable: true },
          { key: 'monthlyUd', label: 'UD/mes', render: (r) => Number(r.monthlyUd).toString() },
          { key: 'reelsIncluded', label: 'Reels incl.', render: (r) => String(r.reelsIncluded ?? 0) },
          { key: 'monthlyPrice', label: 'Precio mensual', render: (r) => r.monthlyPrice ? `$${Number(r.monthlyPrice).toLocaleString()}` : '-' },
          { key: 'status', label: 'Estado', render: (r) => <StatusBadge status={r.status as string} /> },
          { key: 'createdAt', label: 'Creado', render: (r) => new Date(r.createdAt as string).toLocaleDateString() },
        ]}
        data={packs as any[]}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Pack">
        <form onSubmit={handleSubmit} className="modal-form">
          <label>Nombre <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Descripción <textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label>UD Mensual <input className="input" type="number" required value={form.monthlyUd} onChange={(e) => setForm({ ...form, monthlyUd: e.target.value })} /></label>
          <label>Reels Incluidos <input className="input" type="number" required value={form.reelsIncluded} onChange={(e) => setForm({ ...form, reelsIncluded: e.target.value })} /></label>
          <label>Precio Mensual <input className="input" type="number" value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })} /></label>
          <label>Moneda <input className="input" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} /></label>
          <label>Servicios (JSON) <textarea className="input" value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} /></label>
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creando...' : 'Crear'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
