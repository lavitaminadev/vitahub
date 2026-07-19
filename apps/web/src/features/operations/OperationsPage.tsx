import { useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { Card } from '../../shared/Card';
import { StatusBadge } from '../../shared/StatusBadge';
import { LoadingSpinner } from '../../shared/LoadingSpinner';

interface Pod {
  id: string;
  name: string;
  memberCount: number;
  capacity: number;
  currentLoad: number;
  status: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  currentPieces: number;
  capacity: number;
}

interface OperationsData {
  pods: Pod[];
  team: TeamMember[];
  totalCapacity: number;
  usedCapacity: number;
}

export function OperationsPage() {
  const { data, isLoading, error } = useQuery<OperationsData>({
    queryKey: ['operations'],
    queryFn: () => api.get('/operations/overview'),
  });

  if (isLoading) return <LoadingSpinner text="Cargando operaciones..." />;
  if (error) return <div className="alert alert-error">Error al cargar operaciones</div>;
  if (!data) return <div className="alert alert-info">No hay datos de operaciones</div>;

  const utilizationPct = data.totalCapacity > 0 ? Math.round((data.usedCapacity / data.totalCapacity) * 100) : 0;

  return (
    <div className="page">
      <h1>Operaciones</h1>
      <div className="card-grid">
        <Card title="Capacidad Total" value={`${data.totalCapacity} UD`} icon="📊" color="#3498db" />
        <Card title="Capacidad Usada" value={`${data.usedCapacity} UD`} icon="⚡" color="#e67e22" />
        <Card title="Utilización" value={`${utilizationPct}%`} icon="📈" color={utilizationPct > 80 ? '#e74c3c' : '#27ae60'} />
      </div>
      <div className="section">
        <h2>Pods</h2>
        {data.pods.length === 0 ? (
          <div className="alert alert-info">No hay pods configurados</div>
        ) : (
          <div className="pod-grid">
            {data.pods.map((pod) => {
              const loadPct = pod.capacity > 0 ? Math.round((pod.currentLoad / pod.capacity) * 100) : 0;
              return (
                <div key={pod.id} className="pod-card">
                  <div className="pod-header">
                    <span className="pod-name">{pod.name}</span>
                    <StatusBadge status={pod.status} />
                  </div>
                  <div className="pod-stats">
                    <span>{pod.memberCount} miembros</span>
                    <span>{pod.currentLoad}/{pod.capacity} UD</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${loadPct}%`, background: loadPct > 80 ? '#e74c3c' : '#27ae60' }} />
                  </div>
                  <div className="pod-load">{loadPct}%</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="section">
        <h2>Equipo</h2>
        {data.team.length === 0 ? (
          <div className="alert alert-info">No hay miembros en el equipo</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Rol</th>
                  <th>Piezas Actuales</th>
                  <th>Capacidad</th>
                  <th>Carga</th>
                </tr>
              </thead>
              <tbody>
                {data.team.map((m) => {
                  const load = m.capacity > 0 ? Math.round((m.currentPieces / m.capacity) * 100) : 0;
                  return (
                    <tr key={m.id}>
                      <td>{m.name}</td>
                      <td>{m.role}</td>
                      <td>{m.currentPieces}</td>
                      <td>{m.capacity} UD</td>
                      <td>
                        <div className="progress-bar" style={{ width: '100%' }}>
                          <div className="progress-fill" style={{ width: `${load}%`, background: load > 80 ? '#e74c3c' : '#27ae60' }} />
                        </div>
                        <span style={{ fontSize: 12, marginLeft: 8 }}>{load}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
