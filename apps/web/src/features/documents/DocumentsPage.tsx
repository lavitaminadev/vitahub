import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { DataTable } from '../../shared/DataTable';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { StatusBadge } from '../../shared/StatusBadge';
import { Modal } from '../../shared/Modal';

interface DocumentRecord {
  [key: string]: unknown;
  id: string;
  clientId?: string;
  name: string;
  type: string;
  fileUrl?: string;
  driveFileId?: string;
  version: number;
  status: string;
  tags?: string[];
  createdAt: string;
}

interface ClientOption {
  id: string;
  name: string;
}

interface DocumentFormState {
  clientId: string;
  name: string;
  type: string;
  fileUrl: string;
  driveFileId: string;
  status: string;
  tags: string;
}

const emptyForm: DocumentFormState = {
  clientId: '',
  name: '',
  type: 'other',
  fileUrl: '',
  driveFileId: '',
  status: 'draft',
  tags: '',
};

export function DocumentsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentRecord | null>(null);
  const [form, setForm] = useState<DocumentFormState>(emptyForm);
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: () => api.get<{ data: DocumentRecord[] }>('/documents'),
  });

  const { data: clients } = useQuery<ClientOption[]>({
    queryKey: ['clients'],
    queryFn: () => api.get<ClientOption[]>('/clients'),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/documents', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      api.put(`/documents/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const docs = useMemo(() => {
    const source = data?.data ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return source;
    return source.filter((doc) =>
      [doc.name, doc.type, doc.status, doc.fileUrl ?? '', (doc.tags ?? []).join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [data, search]);

  const clientMap = useMemo(
    () => new Map((clients ?? []).map((client) => [client.id, client.name])),
    [clients],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsCreateOpen(true);
  };

  const openEdit = (doc: DocumentRecord) => {
    setEditing(doc);
    setForm({
      clientId: doc.clientId ?? '',
      name: doc.name,
      type: doc.type,
      fileUrl: doc.fileUrl ?? '',
      driveFileId: doc.driveFileId ?? '',
      status: doc.status,
      tags: (doc.tags ?? []).join(', '),
    });
    setIsCreateOpen(true);
  };

  const closeModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsCreateOpen(false);
  };

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      clientId: form.clientId,
      name: form.name.trim(),
      type: form.type.trim(),
      fileUrl: form.fileUrl.trim() || undefined,
      driveFileId: form.driveFileId.trim() || undefined,
      status: form.status.trim() || undefined,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  if (isLoading) return <LoadingSpinner text="Cargando documentos..." />;
  if (error) return <div className="alert alert-error">Error al cargar documentos</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Documentos</h1>
          <p className="page-subtitle">Repositorio operativo con alta, edición y trazabilidad básica por cliente.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          Nuevo documento
        </button>
      </div>

      <div className="filters">
        <input
          className="input"
          placeholder="Buscar por nombre, tipo, estado o tags"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <DataTable<DocumentRecord>
        keyExtractor={(row) => row.id}
        columns={[
          { key: 'name', label: 'Nombre', sortable: true },
          {
            key: 'clientId',
            label: 'Cliente',
            render: (row) => clientMap.get(row.clientId ?? '') ?? 'Sin cliente',
          },
          { key: 'type', label: 'Tipo', sortable: true },
          { key: 'version', label: 'Versión', sortable: true },
          { key: 'status', label: 'Estado', render: (row) => <StatusBadge status={row.status} /> },
          {
            key: 'fileUrl',
            label: 'Archivo',
            render: (row) =>
              row.fileUrl ? (
                <a href={row.fileUrl} target="_blank" rel="noreferrer">
                  Abrir
                </a>
              ) : (
                'Pendiente'
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
            label: 'Acciones',
            render: (row) => (
              <div className="actions-cell">
                <button className="btn btn-sm btn-outline" onClick={() => openEdit(row)}>
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-outline btn-danger"
                  onClick={() => {
                    if (window.confirm(`¿Eliminar "${row.name}"?`)) deleteMutation.mutate(row.id);
                  }}
                  disabled={deleteMutation.isPending}
                >
                  Eliminar
                </button>
              </div>
            ),
          },
        ]}
        data={docs}
        emptyMessage="No hay documentos cargados todavía."
      />

      <Modal
        open={isCreateOpen}
        onClose={closeModal}
        title={editing ? 'Editar documento' : 'Nuevo documento'}
      >
        <form onSubmit={submitForm} className="document-form">
          <div className="form-group">
            <label htmlFor="document-client">Cliente</label>
            <select
              id="document-client"
              className="input"
              value={form.clientId}
              onChange={(event) => setForm((current) => ({ ...current, clientId: event.target.value }))}
              required
            >
              <option value="">Selecciona un cliente</option>
              {(clients ?? []).map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="document-name">Nombre</label>
            <input
              id="document-name"
              className="input"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="document-type">Tipo</label>
              <input
                id="document-type"
                className="input"
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="document-status">Estado</label>
              <select
                id="document-status"
                className="input"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="approved">Approved</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="document-url">URL del archivo</label>
            <input
              id="document-url"
              className="input"
              type="url"
              value={form.fileUrl}
              onChange={(event) => setForm((current) => ({ ...current, fileUrl: event.target.value }))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="document-drive">Drive File ID</label>
            <input
              id="document-drive"
              className="input"
              value={form.driveFileId}
              onChange={(event) => setForm((current) => ({ ...current, driveFileId: event.target.value }))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="document-tags">Tags</label>
            <input
              id="document-tags"
              className="input"
              placeholder="brief, contrato, aprobado"
              value={form.tags}
              onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={closeModal}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Guardando...'
                : editing
                  ? 'Guardar cambios'
                  : 'Crear documento'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
