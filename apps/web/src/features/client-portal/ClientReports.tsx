import { useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { EmptyState } from '../../shared/EmptyState';

interface ClientReportsData {
  totalRevenue: number;
  activeProjects: number;
  avgUdPerClient: number;
  monthlyData?: { month: string; revenue: number; ud: number }[];
  topClients?: { name: string; revenue: number }[];
}

export function ClientReports() {
  const { data, isLoading, error } = useQuery<ClientReportsData>({
    queryKey: ['client-reports'],
    queryFn: () => api.get('/reporting/reports'),
  });

  if (isLoading) return <LoadingSpinner text="Cargando reportes..." />;
  if (error) return <div className="alert alert-error">Error al cargar reportes</div>;
  if (!data) {
    return (
      <EmptyState
        icon="[]"
        title="Sin reportes disponibles"
        description="Todavia no hay reportes publicados para este cliente."
      />
    );
  }

  return (
    <div className="page">
      <h1>Mis reportes</h1>
      <p className="page-subtitle">Consulta el resumen operativo real disponible para tu cuenta y el uso historico de produccion.</p>

      <div className="card-grid">
        <div className="card">
          <div className="card-title">Facturacion pagada</div>
          <div className="card-value">${(data.totalRevenue ?? 0).toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="card-title">Proyectos activos</div>
          <div className="card-value">{data.activeProjects ?? 0}</div>
        </div>
        <div className="card">
          <div className="card-title">UD promedio</div>
          <div className="card-value">{data.avgUdPerClient ?? 0}</div>
        </div>
      </div>

      {(data.monthlyData?.length ?? 0) > 0 ? (
        <div className="portal-list">
          {data.monthlyData?.map((month) => (
            <div key={month.month} className="card portal-item-card">
              <div>
                <h3>{month.month}</h3>
                <p>UD consumidas: {month.ud}</p>
              </div>
              <div className="portal-item-meta">
                <span>Ingresos asociados: ${month.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="[]"
          title="Sin historial mensual"
          description="Todavia no hay suficientes datos historicos para construir una linea mensual."
        />
      )}
    </div>
  );
}
