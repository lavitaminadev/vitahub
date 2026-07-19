import { registerFeature } from '../../core/navigation.registry';

registerFeature({
  id: 'approvals',
  name: 'Aprobaciones',
  navigation: [{ label: 'Aprobaciones', path: '/approvals', icon: '✅', roles: ['admin', 'art_director', 'creative_director', 'community_manager'] }],
  routes: [],
});
