export const API_VERSION = 'v1'

export const PAGINATION_DEFAULT_PAGE = 1
export const PAGINATION_DEFAULT_LIMIT = 20
export const PAGINATION_MAX_LIMIT = 100

export const UD_BUDGET_DEFAULT = 20
export const DIFFICULTY_MIN = 1
export const DIFFICULTY_MAX = 5

export const TOKEN_EXPIRATION_ACCESS = '15m'
export const TOKEN_EXPIRATION_REFRESH = '7d'

export const XP_STREAK_BONUS_MULTIPLIER = 1.5

export const MEETING_MIN_DURATION_MINUTES = 15
export const MEETING_MAX_DURATION_MINUTES = 180

export const FILE_MAX_SIZE_BYTES = 50 * 1024 * 1024
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4'] as const
