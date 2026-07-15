import { useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { Card } from '../../shared/Card';
import { LoadingSpinner } from '../../shared/LoadingSpinner';

interface KpiData {
  revenueYtd: number;
  revenueTarget: number;
  activeClients: number;
  clientTarget: number;
  udSold: number;
  udTarget: number;
  teamUtilization: number;
  utilizationTarget: number;
  clientRetention: number;
  nps: number;
  growthRate: number;
}

export function DirectionPage() {
  const { data, isLoading, error } = useQuery<KpiData>({
    queryKey: ['direction'],
    queryFn: () => api.get('/reporting/kpi'),
  });

  if (isLoading) return <LoadingSpinner text="Cargando KPIs..." />;
  if (error) return <div className="alert alert-error">Error al cargar KPIs</div>;
  if (!data) return <div className="alert alert-info">No hay datos de KPIs</div>;

  const kpis = [
    { title: 'Ingresos YTD', value: `$${(data.revenueYtd ?? 0).toLocaleString()}`, target: `$${(data.revenueTarget ?? 0).toLocaleString()}`, pct: data.revenueTarget ? Math.round((data.revenueYtd / data.revenueTarget) * 100) : 0, color: '#27ae60' },
    { title: 'Clientes Activos', value: data.activeClients ?? 0, target: `Meta: ${data.clientTarget ?? 0}`, pct: data.clientTarget ? Math.round((data.activeClients / data.clientTarget) * 100) : 0, color: '#3498db' },
    { title: 'UD Vendidas', value: data.udSold ?? 0, target: `Meta: ${data.udTarget ?? 0}`, pct: data.udTarget ? Math.round((data.udSold / data.udTarget) * 100) : 0, color: '#9b59b6' },
    { title: 'Utilización Equipo', value: `${data.teamUtilization ?? 0}%`, target: `Meta: ${data.utilizationTarget ?? 0}%`, pct: data.utilizationTarget ? Math.round((data.teamUtilization / data.utilizationTarget) * 100) : 0, color: '#e67e22' },
    { title: 'Retención Clientes', value: `${data.clientRetention ?? 0}%`, target: '', pct: data.clientRetention ?? 0, color: '#1abc9c' },
    { title: 'NPS', value: data.nps ?? 0, target: '', pct: data.nps ? Math.round((data.nps / 10) * 100) : 0, color: '#e74c3c' },
    { title: 'Tasa de Crecimiento', value: `${data.growthRate ?? 0}%`, target: '', pct: Math.min(data.growthRate ?? 0, 100), color: '#2c3e50' },
  ];

  return (
    <div className="page">
      <h1>Dirección - KPIs Estratégicos</h1>
      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="kpi-card">
            <Card title={kpi.title} value={kpi.value} color={kpi.color} />
            {kpi.target && <div className="kpi-target">{kpi.target}</div>}
            <div className="progress-bar kpi-progress">
              <div className="progress-fill" style={{ width: `${Math.min(kpi.pct, 100)}%`, background: kpi.color }} />
            </div>
            <div className="kpi-pct">{kpi.pct}% de la meta</div>
          </div>
        ))}
      </div>
    </div>
  );
}
