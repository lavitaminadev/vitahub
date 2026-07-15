export type NotificationType = 'piece_assigned' | 'piece_status' | 'correction_requested' | 'meeting_reminder' | 'budget_alert' | 'deadline_approaching' | 'system'

export interface NotificationResponse {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  read: boolean
  createdAt: Date
}
