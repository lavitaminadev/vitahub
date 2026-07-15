import { UserDto } from './user'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  organizationId?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserDto
}
