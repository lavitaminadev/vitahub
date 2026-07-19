import { useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { Card } from '../../shared/Card';
import { LoadingSpinner } from '../../shared/LoadingSpinner';

interface KpiData {
  revenueYtd: number;
  revenueTarget: number | null;
  activeClients: number;
  clientTarget: number | null;
  udSold: number;
  udTarget: number | null;
  teamUtilization: number;
  utilizationTarget: number | null;
  clientRetention: number;
  nps: number | null;
  growthRate: number | null;
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
    {
      title: 'Ingresos YTD',
      value: `$${(data.revenueYtd ?? 0).toLocaleString()}`,
      target: data.revenueTarget != null ? `$${data.revenueTarget.toLocaleString()}` : 'Meta no configurada',
      pct: data.revenueTarget ? Math.round((data.revenueYtd / data.revenueTarget) * 100) : null,
      color: '#27ae60',
    },
    {
      title: 'Clientes Activos',
      value: data.activeClients ?? 0,
      target: data.clientTarget != null ? `Meta: ${data.clientTarget}` : 'Meta no configurada',
      pct: data.clientTarget ? Math.round((data.activeClients / data.clientTarget) * 100) : null,
      color: '#3498db',
    },
    {
      title: 'UD Vendidas',
      value: data.udSold ?? 0,
      target: data.udTarget != null ? `Meta: ${data.udTarget}` : 'Meta no configurada',
      pct: data.udTarget ? Math.round((data.udSold / data.udTarget) * 100) : null,
      color: '#9b59b6',
    },
    {
      title: 'Utilizacion Equipo',
      value: `${data.teamUtilization ?? 0}%`,
      target: data.utilizationTarget != null ? `Meta: ${data.utilizationTarget}%` : 'Meta no configurada',
      pct: data.utilizationTarget ? Math.round((data.teamUtilization / data.utilizationTarget) * 100) : null,
      color: '#e67e22',
    },
    {
      title: 'Retencion Clientes',
      value: `${data.clientRetention ?? 0}%`,
      target: 'Metrica real',
      pct: data.clientRetention ?? 0,
      color: '#1abc9c',
    },
    {
      title: 'NPS',
      value: data.nps ?? 'No disponible',
      target: 'Pendiente de fuente real',
      pct: data.nps != null ? Math.round((data.nps / 10) * 100) : null,
      color: '#e74c3c',
    },
    {
      title: 'Tasa de Crecimiento',
      value: data.growthRate != null ? `${data.growthRate}%` : 'No disponible',
      target: 'Pendiente de fuente real',
      pct: data.growthRate != null ? Math.min(data.growthRate, 100) : null,
      color: '#2c3e50',
    },
  ];

  return (
    <div className="page">
      <h1>Direccion - KPIs Estrategicos</h1>
      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="kpi-card">
            <Card title={kpi.title} value={kpi.value} color={kpi.color} />
            {kpi.target && <div className="kpi-target">{kpi.target}</div>}
            <div className="progress-bar kpi-progress">
              <div className="progress-fill" style={{ width: `${Math.min(kpi.pct ?? 0, 100)}%`, background: kpi.color }} />
            </div>
            <div className="kpi-pct">{kpi.pct != null ? `${kpi.pct}% de la meta` : 'Sin meta o fuente verificable'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
