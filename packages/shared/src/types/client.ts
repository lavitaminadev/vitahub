export type ClientStatus = 'onboarding' | 'active' | 'paused' | 'at_risk' | 'churned'

export interface ClientResponse {
  id: string
  organizationId: string
  name: string
  legalName?: string
  industry?: string
  status: ClientStatus
  retainerAmount?: number
  currency: string
  startedAt?: Date
  renewalAt?: Date
  whatsappGroup?: string
  driveFolderId?: string
  defaultUdBudget: number
  createdAt: Date
}

export interface CreateClientRequest {
  name: string
  legalName?: string
  industry?: string
  status?: ClientStatus
  retainerAmount?: number
  leadId?: string
  communityManagerId?: string
}
