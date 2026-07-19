import { registerFeature } from '../../core/navigation.registry';

registerFeature({
  id: 'direction',
  name: 'Dirección',
  navigation: [{ label: 'Dirección', path: '/direction', icon: '🎯', roles: ['admin', 'commercial_director', 'creative_director', 'operations_director'] }],
  routes: [],
});
