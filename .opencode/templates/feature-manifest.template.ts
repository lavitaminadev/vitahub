import { FeatureManifest } from '@/core/feature/types';

export const {{ENTITY}}_FEATURE: FeatureManifest = {
  id: '{{module}}',
  name: '{{FeatureName}}',
  description: '{{description}}',
  version: '1.0.0',
  enabled: true,
  dependencies: ['core', 'organizations'],
  routes: () => import('./routes/{{module}}.routes'),
  navigation: () => import('./navigation/{{module}}.navigation').then(m => m.{{ENTITY}}_NAVIGATION),
  permissions: {
    view: '{{module}}.{{resource}}.view',
    create: '{{module}}.{{resource}}.create',
    update: '{{module}}.{{resource}}.update',
    delete: '{{module}}.{{resource}}.delete',
  },
};
