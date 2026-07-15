export type PieceStatus = 'backlog' | 'assigned' | 'in_progress' | 'internal_review' | 'client_validation' | 'correction' | 'approved' | 'delivered'

export type PieceType = 'post_simple' | 'post_author' | 'carousel' | 'story_original' | 'story_adapted' | 'story_template' | 'reel_cover' | 'flyer_digital' | 'flyer_print'

export interface PieceResponse {
  id: string
  organizationId: string
  clientId: string
  title: string
  type: PieceType
  status: PieceStatus
  difficultyLevel: number
  udAmount: number
  assignedTo?: string
  deadlineAt?: Date
  deliveredAt?: Date
  correctionCount: number
  clientCorrectionCount: number
  createdAt: Date
}

export interface PieceVersionResponse {
  id: string
  pieceId: string
  versionNumber: number
  fileName: string
  driveFileId?: string
  stateLabel?: string
  isFinal: boolean
  namingValid?: boolean
  createdBy: string
  createdAt: Date
}
