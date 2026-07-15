import { AuthApi } from '@modules/auth/api/auth.api'
import type {
  InternalAuthModel,
  LoginApiRequest,
  LoginCredentials,
  RegisterCredentials,
  SignupApiRequest,
  SignupApiResponse,
  User,
} from '@modules/auth/types'
import {
  mapCurrentUserApiResponse,
  mapLoginApiResponse,
  mapRefreshTokenApiResponse,
} from '@modules/auth/utils/mappers'
import { AuthEndpointNotAvailableError, resolveAuthError, resolveSignupError } from '@modules/auth/utils/errors'

export class AuthService {
  private readonly api: AuthApi

  constructor(authBaseUrl?: string) {
    const config = useRuntimeConfig()
    const baseUrl = authBaseUrl ?? (config.public.authBaseUrl as string)
    this.api = new AuthApi(baseUrl)
  }

  async login(credentials: LoginCredentials): Promise<InternalAuthModel> {
    const payload: LoginApiRequest = {
      user: credentials.phone,
      password: credentials.password,
      country_code: credentials.countryCode,
    }

    try {
      const response = await this.api.login(payload)
      return mapLoginApiResponse(response)
    } catch (error) {
      throw resolveAuthError(error)
    }
  }

  async signup(credentials: RegisterCredentials): Promise<SignupApiResponse> {
    const payload: SignupApiRequest = {
      name: credentials.name,
      phone: credentials.phone,
      country_code: credentials.countryCode,
      password: credentials.password,
      confirm_password: credentials.confirmPassword,
      status: credentials.status ?? 'active',
      preferred_date_type: credentials.preferredDateType ?? 'gregorian',
    }

    if (credentials.email) payload.email = credentials.email
    if (credentials.nationalId) payload.national_id = credentials.nationalId
    if (credentials.avatar) payload.avatar = credentials.avatar
    if (credentials.address) payload.address = credentials.address
    if (credentials.otp) payload.otp = credentials.otp
    if (credentials.otpCreatedAt) payload.otp_created_at = credentials.otpCreatedAt

    try {
      return await this.api.signup(payload)
    } catch (error) {
      throw resolveSignupError(error)
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.logout()
    } catch (error) {
      if (error instanceof AuthEndpointNotAvailableError) return
      throw resolveAuthError(error)
    }
  }

  async refreshToken(refreshToken: string): Promise<Pick<InternalAuthModel, 'session'>> {
    try {
      const response = await this.api.refreshToken(refreshToken)
      return mapRefreshTokenApiResponse(response)
    } catch (error) {
      throw resolveAuthError(error)
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.api.getCurrentUser()
      return mapCurrentUserApiResponse(response)
    } catch (error) {
      throw resolveAuthError(error)
    }
  }
}
