export type XpTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

export type XpEventType = 'piece_delivered' | 'piece_approved' | 'correction_resolved' | 'streak_bonus' | 'quality_bonus' | 'client_praise' | 'overtime' | 'mentorship' | 'training_completed' | 'internal_recognition'

export interface XpPeriodResponse {
  id: string
  userId: string
  weekStart: Date
  totalXp: number
  tier: XpTier
  status: string
}

export interface XpEventResponse {
  id: string
  xpPeriodId: string
  pieceId?: string
  type: XpEventType
  points: number
  description?: string
  createdAt: Date
}
