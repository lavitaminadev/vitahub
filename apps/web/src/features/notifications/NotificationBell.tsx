import { useState, useEffect } from 'react';
import { api } from '../../core/api';
import { useAuth } from '../../core/auth';

export function NotificationBell() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const poll = async () => {
      try {
        const res = await api.get<any>('/notifications/unread-count');
        setUnread(res.unread ?? 0);
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const toggle = async () => {
    if (!open) {
      try {
        const data = await api.get<any>('/notifications');
        setNotifs(Array.isArray(data) ? data : []);
      } catch {}
    }
    setOpen(!open);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button className="btn btn-outline btn-sm" onClick={toggle} style={{ position: 'relative' }}>
        🔔
        {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#e74c3c', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>}
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', width: 320, maxHeight: 400, overflowY: 'auto', background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, padding: '0.5rem' }}>
          {notifs.length === 0 ? <p style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>Sin notificaciones</p> : notifs.map((n) => (
            <div key={n.id} style={{ padding: '0.5rem', borderBottom: '1px solid #eee', background: n.read ? 'transparent' : '#f0f7ff' }}>
              <strong style={{ fontSize: 13 }}>{n.title}</strong>
              <p style={{ fontSize: 12, color: '#666', margin: '2px 0' }}>{n.message}</p>
              <span style={{ fontSize: 11, color: '#999' }}>{new Date(n.createdAt).toLocaleDateString('es-CL')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
