import { useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { DataTable } from '../../shared/DataTable';
import { LoadingSpinner } from '../../shared/LoadingSpinner';

export function KnowledgePage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['knowledge'], queryFn: () => api.get('/knowledge') });
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-error">Error al cargar base de conocimiento</div>;
  const chunks: any[] = Array.isArray(data) ? data : (data as any)?.data ?? [];
  return (
    <div className="page">
      <h1>Base de Conocimiento</h1>
      <DataTable
        keyExtractor={(r) => r.id as string}
        columns={[
          { key: 'sourceName', label: 'Fuente', sortable: true },
          { key: 'chunkIndex', label: 'Chunk' },
          { key: 'tokenCount', label: 'Tokens' },
          { key: 'content', label: 'Contenido', render: (r) => (r.content as string).slice(0, 120) + '...' },
          { key: 'createdAt', label: 'Creado', render: (r) => new Date(r.createdAt as number).toLocaleDateString() },
        ]}
        data={chunks}
      />
    </div>
  );
}
