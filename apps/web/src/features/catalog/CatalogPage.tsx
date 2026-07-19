import { useState } from 'react';
import { CatalogServicesTab } from './CatalogServicesTab';
import { CatalogPacksTab } from './CatalogPacksTab';

type Tab = 'services' | 'packs';

export function CatalogPage() {
  const [tab, setTab] = useState<Tab>('services');

  return (
    <div className="page">
      <h1>Catálogo</h1>
      <div className="tabs">
        <button className={`tab ${tab === 'services' ? 'active' : ''}`} onClick={() => setTab('services')}>Servicios</button>
        <button className={`tab ${tab === 'packs' ? 'active' : ''}`} onClick={() => setTab('packs')}>Packs</button>
      </div>
      {tab === 'services' ? <CatalogServicesTab /> : <CatalogPacksTab />}
    </div>
  );
}
