import { useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { Card } from '../../shared/Card';
import { LoadingSpinner } from '../../shared/LoadingSpinner';

interface ReportData {
  totalRevenue: number;
  activeProjects: number;
  avgUdPerClient: number;
  monthlyData?: { month: string; revenue: number; ud: number }[];
  topClients?: { name: string; revenue: number }[];
}

export function ReportsPage() {
  const { data, isLoading, error } = useQuery<ReportData>({
    queryKey: ['reports'],
    queryFn: () => api.get('/reporting/reports'),
  });

  if (isLoading) return <LoadingSpinner text="Cargando reportes..." />;
  if (error) return <div className="alert alert-error">Error al cargar reportes</div>;
  if (!data) return <div className="alert alert-info">No hay datos de reportes</div>;

  return (
    <div className="page">
      <h1>Reportes</h1>
      <div className="card-grid">
        <Card title="Ingresos Totales" value={`$${data.totalRevenue?.toLocaleString() ?? 0}`} icon="💰" color="#27ae60" />
        <Card title="Proyectos Activos" value={data.activeProjects ?? 0} icon="📁" color="#3498db" />
        <Card title="UD Promedio por Cliente" value={data.avgUdPerClient ?? 0} icon="📊" color="#9b59b6" />
      </div>
      {data.monthlyData && data.monthlyData.length > 0 && (
        <div className="section">
          <h2>Desempeño Mensual</h2>
          <div className="chart-container">
            {data.monthlyData.map((m) => {
              const maxVal = Math.max(...data.monthlyData!.map((x) => Math.max(x.revenue, x.ud)), 1);
              return (
                <div key={m.month} className="chart-bar-group">
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar chart-bar-revenue" style={{ height: `${(m.revenue / maxVal) * 100}%` }} title={`$${m.revenue}`} />
                    <div className="chart-bar chart-bar-ud" style={{ height: `${(m.ud / maxVal) * 100}%` }} title={`${m.ud} UD`} />
                  </div>
                  <div className="chart-label">{m.month}</div>
                </div>
              );
            })}
          </div>
          <div className="chart-legend">
            <span><span className="legend-dot" style={{ background: '#27ae60' }} /> Ingresos</span>
            <span><span className="legend-dot" style={{ background: '#3498db' }} /> UD</span>
          </div>
        </div>
      )}
      {data.topClients && data.topClients.length > 0 && (
        <div className="section">
          <h2>Top Clientes</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Cliente</th><th>Ingresos</th></tr>
              </thead>
              <tbody>
                {data.topClients.map((c) => (
                  <tr key={c.name}>
                    <td>{c.name}</td>
                    <td>${c.revenue?.toLocaleString() ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
