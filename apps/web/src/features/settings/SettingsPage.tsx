import { useEffect, useState } from 'react';
import { useAuth } from '../../core/auth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../core/api';

interface OrganizationSummary {
  id: string;
  name: string;
}

export function SettingsPage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name ?? '', email: user?.email ?? '' });
  const [orgName, setOrgName] = useState('');

  const { data: organizations } = useQuery<OrganizationSummary[]>({
    queryKey: ['organizations'],
    queryFn: () => api.get('/organizations'),
    enabled: Boolean(user?.organizationId),
  });

  useEffect(() => {
    const currentOrg = organizations?.find((org) => org.id === user?.organizationId);
    if (currentOrg && !orgName) setOrgName(currentOrg.name);
  }, [organizations, orgName, user?.organizationId]);

  const updateProfile = useMutation({
    mutationFn: (data: typeof profile) => api.put('/auth/profile', data),
    onError: (err) => console.error(err),
  });

  const updateOrg = useMutation({
    mutationFn: (data: { name: string }) => api.put('/organizations/profile', data),
    onError: (err) => console.error(err),
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
              {updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {updateProfile.isSuccess && <span className="alert alert-success" style={{ marginLeft: 8 }}>Perfil actualizado</span>}
          </form>
        </div>
        {user?.organizationId && (
          <div className="settings-section">
            <h2>Organización</h2>
            <form onSubmit={(e) => { e.preventDefault(); updateOrg.mutate({ name: orgName.trim() }); }}>
              <div className="form-group">
                <label>Nombre de la organización</label>
                <input className="input" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Nombre de la organización" />
              </div>
              <button className="btn btn-primary" type="submit" disabled={updateOrg.isPending || !orgName.trim()}>
                {updateOrg.isPending ? 'Guardando...' : 'Actualizar organización'}
              </button>
              {updateOrg.isSuccess && <span className="alert alert-success" style={{ marginLeft: 8 }}>Organización actualizada</span>}
            </form>
          </div>
        )}
        <div className="settings-section">
          <h2>Sesión</h2>
          <button className="btn btn-outline" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
