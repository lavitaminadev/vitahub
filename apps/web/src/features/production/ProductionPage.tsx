import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../core/api';
import { StatusBadge } from '../../shared/StatusBadge';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { Modal } from '../../shared/Modal';

interface Piece {
  id: string;
  title: string;
  type: string;
  status: string;
  udAmount: number;
  correctionCount: number;
  clientName: string;
  assignee: string;
  dueDate: string;
}

export function ProductionPage() {
  const [assignModal, setAssignModal] = useState<{ open: boolean; pieceId: string }>({ open: false, pieceId: '' });
  const [assignee, setAssignee] = useState('');
  const queryClient = useQueryClient();

  const { data: pieces, isLoading, error } = useQuery<Piece[]>({
    queryKey: ['pieces'],
    queryFn: () => api.get('/production/pieces'),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, assignee }: { id: string; assignee: string }) => api.post(`/production/pieces/${id}/assign`, { designerId: assignee }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pieces'] });
      setAssignModal({ open: false, pieceId: '' });
      setAssignee('');
    },
  });

  if (isLoading) return <LoadingSpinner text="Cargando piezas..." />;
  if (error) return <div className="alert alert-error">Error al cargar piezas</div>;

  return (
    <div className="page">
      <h1>Producción</h1>
      {(pieces?.length ?? 0) === 0 ? (
        <div className="alert alert-info">No hay piezas en producción</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Estado</th>
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
                  <td>{piece.udAmount}</td>
                  <td>{piece.correctionCount}</td>
                  <td>{piece.assignee || '—'}</td>
                  <td>{piece.dueDate ? new Date(piece.dueDate).toLocaleDateString() : '—'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => setAssignModal({ open: true, pieceId: piece.id })}>
                      Asignar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={assignModal.open} onClose={() => setAssignModal({ open: false, pieceId: '' })} title="Asignar Pieza">
        <form onSubmit={(e) => { e.preventDefault(); assignMutation.mutate({ id: assignModal.pieceId, assignee }); }}>
          <div className="form-group">
            <label>Asignar a</label>
            <input className="input" value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Nombre del asignado" required />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={assignMutation.isPending}>
            {assignMutation.isPending ? 'Asignando...' : 'Asignar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
