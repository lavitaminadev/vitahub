import { registerFeature } from '../../core/navigation.registry';

registerFeature({
  id: 'crm',
  name: 'Leads CRM',
  navigation: [{ label: 'Leads CRM', path: '/crm/leads', icon: '🎯', roles: ['admin', 'commercial_director'] }],
  routes: [],
});
