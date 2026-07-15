export type LeadStatus = 'new' | 'contacted' | 'meeting_scheduled' | 'quote_sent' | 'negotiation' | 'won' | 'lost'

export interface LeadResponse {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  source?: string
  status: LeadStatus
  assignedTo?: string
  notes?: string
  convertedAt?: Date
  convertedToClientId?: string
  createdAt: Date
}

export interface CreateLeadRequest {
  name: string
  email?: string
  phone?: string
  company?: string
  source?: string
}
