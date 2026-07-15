export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type ApprovalEntityType = 'piece' | 'content_grid' | 'budget' | 'invoice'

export interface ApprovalResponse {
  id: string
  entityType: ApprovalEntityType
  entityId: string
  requestedBy: string
  approvedBy?: string
  status: ApprovalStatus
  comment?: string
  requestedAt: Date
  decidedAt?: Date
}
