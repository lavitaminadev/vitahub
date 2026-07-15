export type UdMovementType = 'budget_assigned' | 'reservation' | 'consumption' | 'adjustment' | 'extra' | 'rollover'

export interface UdBudgetResponse {
  id: string
  clientId: string
  year: number
  month: number
  contracted: number
  reserved: number
  consumed: number
  status: string
  createdAt: Date
}

export interface UdMovementResponse {
  id: string
  udBudgetId: string
  pieceId?: string
  type: UdMovementType
  amount: number
  reason: string
  actorId?: string
  createdAt: Date
}
