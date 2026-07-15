import { useState } from 'react';
import { useAuth } from '../../core/auth';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../core/api';

export function SettingsPage() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name ?? '', email: user?.email ?? '' });
  const [orgName, setOrgName] = useState('');

  const updateProfile = useMutation({
    mutationFn: (data: typeof profile) => api.put('/auth/profile', data),
  });

  const updateOrg = useMutation({
    mutationFn: (data: { name: string }) => api.put('/organizations/profile', data),
  });

  return (
    <div className="page">
      <h1>Configuración</h1>
      <div className="settings-grid">
        <div className="settings-section">
          <h2>Perfil</h2>
          <form onSubmit={(e) => { e.preventDefault(); updateProfile.mutate(profile); }}>
            <div className="form-group">
              <label>Nombre</label>
              <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="input" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            {updateProfile.isSuccess && <span className="alert alert-success" style={{ marginLeft: 8 }}>Perfil actualizado</span>}
          </form>
        </div>
        {user?.organizationId && (
          <div className="settings-section">
            <h2>Organización</h2>
            <form onSubmit={(e) => { e.preventDefault(); updateOrg.mutate({ name: orgName }); }}>
              <div className="form-group">
                <label>Nombre de la Organización</label>
                <input className="input" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Nombre de la organización" />
              </div>
              <button className="btn btn-primary" type="submit" disabled={updateOrg.isPending}>
                {updateOrg.isPending ? 'Guardando...' : 'Actualizar Organización'}
              </button>
              {updateOrg.isSuccess && <span className="alert alert-success" style={{ marginLeft: 8 }}>Organización actualizada</span>}
            </form>
          </div>
        )}
        <div className="settings-section">
          <h2>Sesión</h2>
          <p style={{ color: '#666', fontSize: 14 }}>Token activo: {token ? `${token.slice(0, 20)}...` : 'No disponible'}</p>
        </div>
      </div>
    </div>
  );
}
