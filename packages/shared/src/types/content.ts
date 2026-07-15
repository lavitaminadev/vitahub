export type ContentGridStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'published'

export type ContentItemStatus = 'pending' | 'in_production' | 'completed'

export interface ContentGridResponse {
  id: string
  clientId: string
  title: string
  weekStart: Date
  weekEnd: Date
  status: ContentGridStatus
  createdAt: Date
}

export interface ContentItemResponse {
  id: string
  contentGridId: string
  type: string
  status: ContentItemStatus
  caption?: string
  dueDate?: Date
  pieceId?: string
  createdAt: Date
}
