export type UserWorkMode = 'presential' | 'hybrid' | 'remote'

export interface UserDto {
  id: string
  email: string
  name: string
  role: string
  organizationId: string
}

export interface UserResponse {
  id: string
  email: string
  name: string
  role: string
  organizationId: string
  phone?: string
  avatarUrl?: string
  workMode?: UserWorkMode
  isActive: boolean
  createdAt: Date
}

export interface CreateUserRequest {
  email: string
  password: string
  name: string
  role?: string
  phone?: string
}

export interface UpdateUserRequest {
  name?: string
  role?: string
  phone?: string
  avatarUrl?: string
  workMode?: UserWorkMode
}
