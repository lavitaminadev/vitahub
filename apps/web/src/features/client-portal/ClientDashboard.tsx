import { Link } from 'react-router-dom';
import { useAuth } from '../../core/auth';

const PORTAL_CARDS = [
  {
    title: 'Mi parrilla',
    description: 'Revisa el contenido planificado para tu marca y sus ventanas de publicación.',
    link: '/portal/grid',
    action: 'Ver parrilla',
  },
  {
    title: 'Aprobaciones',
    description: 'Resuelve piezas pendientes y mantén el flujo creativo avanzando sin fricción.',
    link: '/portal/approvals',
    action: 'Revisar piezas',
  },
  {
    title: 'Reuniones',
    description: 'Consulta próximos encuentros, modalidad y enlaces de acceso.',
    link: '/portal/meetings',
    action: 'Ver reuniones',
  },
  {
    title: 'Reportes',
    description: 'Accede a resultados, contexto y entregables de performance.',
    link: '/portal/reports',
    action: 'Ver reportes',
  },
];

export function ClientDashboard() {
  const { user } = useAuth();

  return (
    <div className="page">
      <h1>Bienvenido, {user?.name}</h1>
      <p className="page-subtitle">Este portal concentra tus revisiones, contenido, reuniones y resultados en un solo flujo.</p>

      <div className="card-grid">
        {PORTAL_CARDS.map((card) => (
          <div key={card.link} className="card portal-home-card">
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <Link to={card.link} className="btn btn-primary btn-sm">
              {card.action}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
