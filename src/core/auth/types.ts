export type {
  User,
  Role,
  Permission,
  Token,
  RefreshToken,
  Session,
  InternalAuthModel,
  LoginCredentials,
  AuthState,
  RefreshTokenResponse,
  User as AuthUser,
  Role as AuthRole,
  Permission as AuthPermission,
} from '@modules/auth/types'

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'user' | 'guest'
