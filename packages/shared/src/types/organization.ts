export interface OrganizationSettings {
  timezone?: string
  currency?: string
  weekStartDay?: 'monday' | 'sunday'
  approvalFlow?: 'sequential' | 'parallel'
  retentionPolicyDays?: number
}

export interface OrganizationResponse {
  id: string
  name: string
  code: string
  logoUrl?: string
  timezone: string
  isActive: boolean
  settings?: OrganizationSettings
  createdAt: Date
}
