import type { LoginApiRequest, SignupApiRequest } from './api.types'

export type {
  LoginApiRequest,
  SignupApiRequest,
  SignupApiResponse,
  LoginApiUserDto,
  LoginApiRoleDto,
  LoginApiResponse,
  LoginApiResponseV1,
  LoginApiResponseV2,
  RefreshTokenApiResponse,
  CurrentUserApiResponse,
  UpdateFcmTokenApiPayload,
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
  RegisterCredentials,
  RefreshTokenResponse,
  AuthState,
} from './internal.types'

/** Application login request mapped to API payload */
export type LoginRequest = LoginApiRequest

/** Application signup request mapped to API payload */
export type RegisterRequest = SignupApiRequest
