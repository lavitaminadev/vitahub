import { useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { EmptyState } from '../../shared/EmptyState';

interface ClientGridItem {
  id: string;
  title?: string;
  weekStart?: string;
  weekEnd?: string;
  status?: string;
}

export function ClientGrid() {
  const { data, isLoading, error } = useQuery<ClientGridItem[]>({
    queryKey: ['client-grid'],
    queryFn: () => api.get('/content/grids'),
  });

  if (isLoading) return <LoadingSpinner text="Cargando parrilla..." />;
  if (error) return <div className="alert alert-error">Error al cargar parrilla de contenido</div>;

  const grids = Array.isArray(data) ? data : [];

  return (
    <div className="page">
      <h1>Mi parrilla de contenido</h1>
      <p className="page-subtitle">Consulta el contenido planificado y la ventana semanal de cada entrega.</p>

      {grids.length === 0 ? (
        <EmptyState
          icon="[]"
          title="Sin contenido planificado"
          description="Aún no hay publicaciones cargadas en la parrilla de este cliente."
        />
      ) : (
        <div className="portal-list">
          {grids.map((grid) => (
            <div key={grid.id} className="card portal-item-card">
              <div>
                <h3>{grid.title || 'Bloque de contenido'}</h3>
                <p>
                  Semana:{' '}
                  {grid.weekStart && grid.weekEnd
                    ? `${grid.weekStart} al ${grid.weekEnd}`
                    : 'rango no informado'}
                </p>
              </div>
              <div className="portal-item-meta">
                <span>{grid.status || 'planificado'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
