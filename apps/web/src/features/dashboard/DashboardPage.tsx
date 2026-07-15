import { useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { Card } from '../../shared/Card';
import { LoadingSpinner } from '../../shared/LoadingSpinner';

interface DashboardData {
  activeClients: number;
  pendingPieces: number;
  teamXp: number;
  monthUd: number;
  ud?: { contracted: number; consumed: number; reserved: number };
  pieces?: { status: string; count: number }[];
}

export function DashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/reporting/dashboard'),
  });

  if (isLoading) return <LoadingSpinner text="Cargando dashboard..." />;
  if (error) return <div className="alert alert-error">Error al cargar dashboard</div>;
  if (!data) return <div className="alert alert-info">No hay datos disponibles</div>;

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="card-grid">
        <Card title="Clientes Activos" value={data.activeClients ?? 0} icon="👥" color="#1a1a2e" />
        <Card title="Piezas Pendientes" value={data.pendingPieces ?? 0} icon="⏳" color="#f39c12" />
        <Card title="XP del Equipo" value={data.teamXp ?? 0} icon="⭐" color="#9b59b6" />
        <Card title="UD este Mes" value={data.monthUd ?? 0} icon="📊" color="#27ae60" />
      </div>
      {data.ud && (
        <div className="section">
          <h2>Unidades de Dedicatoria</h2>
          <div className="card-grid">
            <Card title="Contratadas" value={data.ud.contracted} color="#e67e22" />
            <Card title="Consumidas" value={data.ud.consumed} color="#27ae60" />
            <Card title="Reservadas" value={data.ud.reserved} color="#3498db" />
          </div>
        </div>
      )}
      {data.pieces && data.pieces.length > 0 && (
        <div className="section">
          <h2>Estado de Piezas</h2>
          <div className="card-grid">
            {data.pieces.map((p) => (
              <Card key={p.status} title={p.status.replace(/_/g, ' ')} value={p.count} color="#8e44ad" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
