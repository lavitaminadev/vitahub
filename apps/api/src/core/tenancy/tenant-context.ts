import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextStore {
  organizationId: string;
}

export const tenantContext = new AsyncLocalStorage<TenantContextStore>();
