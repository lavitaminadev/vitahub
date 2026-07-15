export type IntegrationProvider = 'google_drive' | 'whatsapp' | 'slack' | 'trello' | 'notion' | 'custom'

export type IntegrationStatus = 'connected' | 'disconnected' | 'error'

export interface IntegrationResponse {
  id: string
  organizationId: string
  provider: IntegrationProvider
  status: IntegrationStatus
  config?: Record<string, unknown>
  lastSyncAt?: Date
  createdAt: Date
}
