import { registerFeature } from '../../core/navigation.registry';

registerFeature({
  id: 'knowledge',
  name: 'Knowledge',
  navigation: [{ label: 'Knowledge', path: '/knowledge', icon: '🧠', roles: ['admin', 'ai_lead'] }],
  routes: [],
});
