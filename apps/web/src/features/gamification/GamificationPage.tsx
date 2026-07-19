import { useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';
import { LoadingSpinner } from '../../shared/LoadingSpinner';

const TIER_COLORS: Record<string, string> = { bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2', diamond: '#b9f2ff' };

export function GamificationPage() {
  const { data: ranking, isLoading, error } = useQuery({ queryKey: ['gamification-ranking'], queryFn: () => api.get('/gamification/ranking') });
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-error">Error al cargar ranking</div>;
  const users = Array.isArray(ranking) ? ranking : [];
  return (
    <div className="page">
      <h1>Gamificación — Ranking Semanal</h1>
      <div className="card" style={{ padding: '1.5rem' }}>
        <table className="table">
          <thead><tr><th>#</th><th>Diseñador</th><th>XP</th><th>Tier</th></tr></thead>
          <tbody>
            {users.map((u: any, i: number) => (
              <tr key={u.id}>
                <td>{i + 1}</td>
                <td>{u.user?.name || u.userId}</td>
                <td><strong>{u.totalXp}</strong></td>
                <td>{u.tier ? <span style={{ color: TIER_COLORS[u.tier], fontWeight: 700 }}>{u.tier.toUpperCase()}</span> : '-'}</td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#666' }}>Sin datos esta semana</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
