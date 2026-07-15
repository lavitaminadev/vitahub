export type BillingStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded'

export type BillingPeriod = 'monthly' | 'quarterly' | 'biannual' | 'annual'

export interface BillingResponse {
  id: string
  clientId: string
  invoiceNumber: string
  amount: number
  currency: string
  status: BillingStatus
  period: BillingPeriod
  issuedAt: Date
  dueAt: Date
  paidAt?: Date
  notes?: string
  createdAt: Date
}
