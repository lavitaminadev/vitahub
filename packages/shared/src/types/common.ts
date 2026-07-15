export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: ApiError[]
}

export interface ApiError {
  field?: string
  message: string
}

export interface DateRange {
  start: Date
  end: Date
}
