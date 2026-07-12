import type { LoginApiRequest } from './api.types'

export type {
  LoginApiRequest,
  LoginApiUserDto,
  LoginApiRoleDto,
  LoginApiResponse,
  LoginApiResponseV1,
  LoginApiResponseV2,
  RefreshTokenApiResponse,
  CurrentUserApiResponse,
} from './api.types'

export type {
  User,
  Role,
  Permission,
  Token,
  RefreshToken,
  Session,
  InternalAuthModel,
  LoginCredentials,
  RefreshTokenResponse,
  AuthState,
} from './internal.types'

/** Application login request mapped to API payload */
export type LoginRequest = LoginApiRequest
