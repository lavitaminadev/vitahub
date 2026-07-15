import type { ClientStatus } from '../types/client'
import type { LeadStatus } from '../types/lead'
import type { PieceStatus, PieceType } from '../types/production'
import type { UdMovementType } from '../types/design-budget'
import type { XpTier, XpEventType } from '../types/gamification'
import type { MeetingType, MeetingStatus } from '../types/meeting'
import type { ContentGridStatus, ContentItemStatus } from '../types/content'
import type { NotificationType } from '../types/notification'
import type { BillingStatus, BillingPeriod } from '../types/billing'
import type { ApprovalStatus, ApprovalEntityType } from '../types/approval'
import type { IntegrationProvider, IntegrationStatus } from '../types/integration'
import type { UserWorkMode } from '../types/user'

export const ClientStatuses: readonly ClientStatus[] = ['onboarding', 'active', 'paused', 'at_risk', 'churned'] as const

export const LeadStatuses: readonly LeadStatus[] = ['new', 'contacted', 'meeting_scheduled', 'quote_sent', 'negotiation', 'won', 'lost'] as const

export const PieceStatuses: readonly PieceStatus[] = ['backlog', 'assigned', 'in_progress', 'internal_review', 'client_validation', 'correction', 'approved', 'delivered'] as const

export const PieceTypes: readonly PieceType[] = ['post_simple', 'post_author', 'carousel', 'story_original', 'story_adapted', 'story_template', 'reel_cover', 'flyer_digital', 'flyer_print'] as const

export const UdMovementTypes: readonly UdMovementType[] = ['budget_assigned', 'reservation', 'consumption', 'adjustment', 'extra', 'rollover'] as const

export const XpTiers: readonly XpTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as const

export const XpEventTypes: readonly XpEventType[] = ['piece_delivered', 'piece_approved', 'correction_resolved', 'streak_bonus', 'quality_bonus', 'client_praise', 'overtime', 'mentorship', 'training_completed', 'internal_recognition'] as const

export const MeetingTypes: readonly MeetingType[] = ['strategic', 'weekly'] as const

export const MeetingStatuses: readonly MeetingStatus[] = ['scheduled', 'completed', 'cancelled', 'rescheduled'] as const

export const ContentGridStatuses: readonly ContentGridStatus[] = ['draft', 'submitted', 'approved', 'rejected', 'published'] as const

export const ContentItemStatuses: readonly ContentItemStatus[] = ['pending', 'in_production', 'completed'] as const

export const NotificationTypes: readonly NotificationType[] = ['piece_assigned', 'piece_status', 'correction_requested', 'meeting_reminder', 'budget_alert', 'deadline_approaching', 'system'] as const

export const BillingStatuses: readonly BillingStatus[] = ['pending', 'paid', 'overdue', 'cancelled', 'refunded'] as const

export const BillingPeriods: readonly BillingPeriod[] = ['monthly', 'quarterly', 'biannual', 'annual'] as const

export const ApprovalStatuses: readonly ApprovalStatus[] = ['pending', 'approved', 'rejected', 'cancelled'] as const

export const ApprovalEntityTypes: readonly ApprovalEntityType[] = ['piece', 'content_grid', 'budget', 'invoice'] as const

export const IntegrationProviders: readonly IntegrationProvider[] = ['google_drive', 'whatsapp', 'slack', 'trello', 'notion', 'custom'] as const

export const IntegrationStatuses: readonly IntegrationStatus[] = ['connected', 'disconnected', 'error'] as const

export const UserWorkModes: readonly UserWorkMode[] = ['presential', 'hybrid', 'remote'] as const
