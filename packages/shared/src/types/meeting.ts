export type MeetingType = 'strategic' | 'weekly'

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'

export interface MeetingResponse {
  id: string
  clientId: string
  title: string
  type: MeetingType
  status: MeetingStatus
  date: Date
  durationMinutes?: number
  notes?: string
  createdBy: string
  createdAt: Date
}
