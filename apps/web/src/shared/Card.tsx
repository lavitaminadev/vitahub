interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: string;
}

export function Card({ title, value, subtitle, color = '#1a1a2e', icon }: CardProps) {
  return (
    <div className="card">
      <div className="card-header">
        {icon && <span className="card-icon">{icon}</span>}
        <span className="card-title">{title}</span>
      </div>
      <div className="card-value" style={{ color }}>{value}</div>
      {subtitle && <div className="card-subtitle">{subtitle}</div>}
    </div>
  );
}
