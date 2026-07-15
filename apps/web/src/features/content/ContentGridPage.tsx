import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { StatusBadge } from '../../shared/StatusBadge';
import { LoadingSpinner } from '../../shared/LoadingSpinner';

interface ContentItem {
  id: string;
  title: string;
  clientName: string;
  month: string;
  year: number;
  type: string;
  status: string;
}

export function ContentGridPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const { data: items, isLoading, error } = useQuery<ContentItem[]>({
    queryKey: ['content-grid', selectedMonth],
    queryFn: () => api.get(`/content/grids?month=${selectedMonth}`),
  });

  const grouped: Record<string, ContentItem[]> = {};
  (items ?? []).forEach((item) => {
    if (!grouped[item.clientName]) grouped[item.clientName] = [];
    grouped[item.clientName].push(item);
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Calendario de Contenido</h1>
        <input type="month" className="input" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
      </div>
      {isLoading && <LoadingSpinner text="Cargando contenido..." />}
      {error && <div className="alert alert-error">Error al cargar contenido</div>}
      {!isLoading && !error && (items?.length ?? 0) === 0 && (
        <div className="alert alert-info">No hay contenido para este mes</div>
      )}
      {!isLoading && !error && Object.keys(grouped).length > 0 && (
        <div className="content-grid">
          {Object.entries(grouped).map(([client, clientItems]) => (
            <div key={client} className="content-group">
              <h3>{client}</h3>
              <div className="content-cards">
                {clientItems.map((item) => (
                  <div key={item.id} className="content-card">
                    <div className="content-card-title">{item.title}</div>
                    <div className="content-card-type">{item.type}</div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
