import { registerFeature } from '../../core/navigation.registry';

registerFeature({
  id: 'billing',
  name: 'Facturación',
  navigation: [{ label: 'Facturación', path: '/billing', icon: '💰', roles: ['admin', 'commercial_director', 'operations_director'] }],
  routes: [],
});
