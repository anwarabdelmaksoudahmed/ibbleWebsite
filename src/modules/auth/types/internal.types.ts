/** Application-internal auth model — UI and store consume only these types */

export type User = {
  id: string
  name: string
  nationalId: string
  phone: string
  countryCode: string
  email: string
  avatar: string | null
  preferredDateType: string
  status: string
  address: string | null
  createdAt: string
  updatedAt: string
}

export type Role = {
  appName: string
  name: string
}

export type Permission = string

export type Token = {
  accessToken: string
  expiresAt: string | null
  expiresIn: number | null
}

export type RefreshToken = {
  token: string
  expiresAt: string | null
  expiresIn: number | null
}

export type Session = {
  accessToken: Token
  refreshToken: RefreshToken | null
}

export type InternalAuthModel = {
  user: User
  session: Session
  roles: Role[]
  permissions: Permission[]
}

export type LoginCredentials = {
  phone: string
  password: string
  countryCode: string
  remember?: boolean
}

export type RegisterCredentials = {
  name: string
  phone: string
  countryCode: string
  password: string
  confirmPassword: string
  email?: string
  nationalId?: string
  avatar?: string
  address?: string
  otp?: string
  otpCreatedAt?: string
  status?: string
  preferredDateType?: string
}

export type RefreshTokenResponse = Pick<InternalAuthModel, 'session'>

export type AuthState = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  sessionExpiresAt: string | null
  refreshExpiresAt: string | null
  roles: Role[]
  permissions: Permission[]
  isAuthenticated: boolean
  isLoading: boolean
}
