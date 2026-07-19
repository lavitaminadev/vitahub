import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { StatusBadge } from '../../shared/StatusBadge';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { Modal } from '../../shared/Modal';
import { EmptyState } from '../../shared/EmptyState';

interface Piece {
  id: string;
  title: string;
  type: string;
  status: string;
  udAmount: number;
  correctionCount: number;
  difficultyLevel?: number;
  clientName: string;
  assignedTo?: string;
  dueDate?: string;
}

interface UserOption {
  id: string;
  name: string;
  role: string;
}

interface ClientOption {
  id: string;
  name: string;
}

interface PieceFormState {
  clientId: string;
  title: string;
  type: string;
  difficultyLevel: string;
}

const EMPTY_FORM: PieceFormState = {
  clientId: '',
  title: '',
  type: 'post_simple',
  difficultyLevel: '1',
};

const PIECE_TYPES = [
  'post_simple',
  'post_author',
  'carousel',
  'story_original',
  'story_adapted',
  'story_template',
  'reel_cover',
  'flyer_digital',
  'flyer_print',
] as const;

export function ProductionPage() {
  const [assignModal, setAssignModal] = useState<{ open: boolean; pieceId: string }>({ open: false, pieceId: '' });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [form, setForm] = useState<PieceFormState>(EMPTY_FORM);
  const queryClient = useQueryClient();

  const querySuffix = statusFilter ? `?status=${statusFilter}` : '';

  const { data: pieces, isLoading, error } = useQuery<Piece[]>({
    queryKey: ['pieces', statusFilter],
    queryFn: () => api.get(`/production/pieces${querySuffix}`),
  });

  const { data: users } = useQuery<UserOption[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/users'),
  });

  const { data: clients } = useQuery<ClientOption[]>({
    queryKey: ['clients'],
    queryFn: () => api.get('/clients'),
  });

  const assignableUsers = useMemo(
    () => (users ?? []).filter((user) => ['designer', 'audiovisual', 'art_director', 'admin'].includes(user.role)),
    [users],
  );

  const userMap = useMemo(
    () => new Map(assignableUsers.map((user) => [user.id, user.name])),
    [assignableUsers],
  );

  const refreshPieces = async (message: string) => {
    await queryClient.invalidateQueries({ queryKey: ['pieces'] });
    setFeedbackMessage(message);
  };

  const assignMutation = useMutation({
    mutationFn: ({ id, designerId }: { id: string; designerId: string }) =>
      api.post(`/production/pieces/${id}/assign`, { designerId }),
    onSuccess: () => {
      void refreshPieces('Pieza asignada correctamente.');
      setAssignModal({ open: false, pieceId: '' });
      setAssigneeId('');
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/production/pieces', body),
    onSuccess: () => {
      void refreshPieces('Pieza creada y enviada al tablero.');
      setCreateModalOpen(false);
      setForm(EMPTY_FORM);
    },
  });

  const transitionMutation = useMutation({
    mutationFn: ({ pieceId, action }: { pieceId: string; action: 'start' | 'send-to-client' | 'approve' | 'deliver' }) =>
      api.post(`/production/pieces/${pieceId}/${action}`),
    onSuccess: (_data, variables) => {
      const messages: Record<string, string> = {
        start: 'La pieza paso a En progreso.',
        'send-to-client': 'La pieza fue enviada a validacion del cliente.',
        approve: 'La pieza fue aprobada.',
        deliver: 'La pieza fue marcada como entregada.',
      };
      void refreshPieces(messages[variables.action]);
    },
  });

  if (isLoading) return <LoadingSpinner text="Cargando piezas..." />;
  if (error) return <div className="alert alert-error">Error al cargar piezas</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Produccion</h1>
          <p className="page-subtitle">Flujo alineado al Maestro: backlog, asignacion, progreso, revision interna, validacion cliente, correccion, aprobado y entregado.</p>
        </div>
        <div className="portal-item-actions">
          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="backlog">Backlog</option>
            <option value="assigned">Asignado</option>
            <option value="in_progress">En progreso</option>
            <option value="internal_review">Revision interna</option>
            <option value="client_validation">Validacion cliente</option>
            <option value="correction">Correccion</option>
            <option value="approved">Aprobado</option>
            <option value="delivered">Entregado</option>
          </select>
          <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
            Nueva pieza
          </button>
        </div>
      </div>

      {feedbackMessage && <div className="alert alert-success">{feedbackMessage}</div>}

      {(pieces?.length ?? 0) === 0 ? (
        <EmptyState
          icon="[]"
          title="Sin piezas en produccion"
          description="Todavia no hay piezas activas para este filtro."
        />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Titulo</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Nivel</th>
                <th>UD</th>
                <th>Correcciones</th>
                <th>Asignado a</th>
                <th>Vence</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pieces?.map((piece) => (
                <tr key={piece.id}>
                  <td>{piece.title}</td>
                  <td>{piece.clientName}</td>
                  <td>{piece.type}</td>
                  <td><StatusBadge status={piece.status} /></td>
                  <td>N{piece.difficultyLevel ?? 1}</td>
                  <td>{piece.udAmount}</td>
                  <td>{piece.correctionCount}</td>
                  <td>{piece.assignedTo ? userMap.get(piece.assignedTo) ?? piece.assignedTo : 'Sin asignar'}</td>
                  <td>{piece.dueDate ? new Date(piece.dueDate).toLocaleDateString() : 'Sin fecha'}</td>
                  <td>
                    <div className="table-actions-inline">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          setFeedbackMessage(null);
                          setAssignModal({ open: true, pieceId: piece.id });
                        }}
                      >
                        Asignar
                      </button>
                      {piece.status === 'assigned' && (
                        <button className="btn btn-sm btn-outline" onClick={() => transitionMutation.mutate({ pieceId: piece.id, action: 'start' })}>
                          Iniciar
                        </button>
                      )}
                      {piece.status === 'internal_review' && (
                        <button className="btn btn-sm btn-outline" onClick={() => transitionMutation.mutate({ pieceId: piece.id, action: 'send-to-client' })}>
                          Enviar cliente
                        </button>
                      )}
                      {piece.status === 'client_validation' && (
                        <button className="btn btn-sm btn-outline" onClick={() => transitionMutation.mutate({ pieceId: piece.id, action: 'approve' })}>
                          Aprobar
                        </button>
                      )}
                      {piece.status === 'approved' && (
                        <button className="btn btn-sm btn-outline" onClick={() => transitionMutation.mutate({ pieceId: piece.id, action: 'deliver' })}>
                          Entregar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={assignModal.open} onClose={() => setAssignModal({ open: false, pieceId: '' })} title="Asignar pieza">
        <form
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault();
            assignMutation.mutate({ id: assignModal.pieceId, designerId: assigneeId });
          }}
        >
          <label>
            Asignar a
            <select className="input" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} required>
              <option value="">Selecciona un responsable</option>
              {assignableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </label>

          <button className="btn btn-primary btn-block" type="submit" disabled={assignMutation.isPending || !assigneeId}>
            {assignMutation.isPending ? 'Asignando...' : 'Confirmar asignacion'}
          </button>
        </form>
      </Modal>

      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Nueva pieza">
        <form
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({
              clientId: form.clientId,
              title: form.title.trim(),
              type: form.type,
              difficultyLevel: Number(form.difficultyLevel),
            });
          }}
        >
          <label>
            Cliente
            <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required>
              <option value="">Selecciona un cliente</option>
              {(clients ?? []).map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Titulo
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label>
            Tipo
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {PIECE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nivel
            <select className="input" value={form.difficultyLevel} onChange={(e) => setForm({ ...form, difficultyLevel: e.target.value })}>
              <option value="1">N1</option>
              <option value="2">N2</option>
              <option value="3">N3</option>
              <option value="4">N4</option>
              <option value="5">N5</option>
            </select>
          </label>
          <button className="btn btn-primary btn-block" type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creando...' : 'Crear pieza'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
