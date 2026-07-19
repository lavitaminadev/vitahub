import { registerFeature } from '../../core/navigation.registry';

registerFeature({
  id: 'gamification',
  name: 'Gamificación',
  navigation: [{ label: 'Gamificación', path: '/gamification', icon: '🏆', roles: ['admin', 'art_director', 'designer'] }],
  routes: [],
});
