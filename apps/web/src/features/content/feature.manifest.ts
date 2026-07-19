import { registerFeature } from '../../core/navigation.registry';

registerFeature({
  id: 'content',
  name: 'Contenido',
  navigation: [{ label: 'Contenido', path: '/content', icon: '📝', roles: ['admin', 'creative_director', 'community_manager'] }],
  routes: [],
});
