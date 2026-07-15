import { NavigationItem } from '@/core/navigation/types';

export const {{ENTITY}}_NAVIGATION: NavigationItem[] = [
  {
    id: '{{module}}.{{resource}}',
    label: '{{LabelPlural}}',
    icon: '{{icon}}',
    href: '/{{module}}/{{pluralName}}',
    permissions: ['{{module}}.{{resource}}.view'],
    children: [
      { id: '{{module}}.{{resource}}.list', label: 'Listado', href: '/{{module}}/{{pluralName}}' },
      { id: '{{module}}.{{resource}}.create', label: 'Nuevo', href: '/{{module}}/{{pluralName}}/new', permissions: ['{{module}}.{{resource}}.create'] },
    ],
  },
];
