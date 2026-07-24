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
import { buildFcmDevicePayload } from '@shared/firebase/device'
import { resolveFirebaseMessagingTokenForLogin } from '@shared/firebase/messaging'

export class AuthService {
  private readonly api: AuthApi

  constructor(authBaseUrl?: string) {
    const config = useRuntimeConfig()
    const baseUrl = authBaseUrl ?? (config.public.authBaseUrl as string)
    this.api = new AuthApi(baseUrl)
  }

  async login(credentials: LoginCredentials): Promise<InternalAuthModel> {
    const device = await this.resolveLoginDeviceFields()
    const payload: LoginApiRequest = {
      user: credentials.phone,
      password: credentials.password,
      country_code: credentials.countryCode,
      fcm_token: device.fcm_token,
      device_type: device.device_type,
      device_id: device.device_id,
    }

    console.log('[Auth] login payload device fields', {
      fcm_token_length: payload.fcm_token?.length ?? 0,
      fcm_token_preview: payload.fcm_token?.slice(0, 16) || '',
      device_type: payload.device_type,
      device_id: payload.device_id,
    })

    try {
      const response = await this.api.login(payload)
      return mapLoginApiResponse(response)
    } catch (error) {
      throw resolveAuthError(error)
    }
  }

  /** Best-effort FCM + stable web device id for SSO login (matches legacy site). */
  private async resolveLoginDeviceFields(): Promise<{
    fcm_token: string
    device_type: string
    device_id: string
  }> {
    const empty = buildFcmDevicePayload('')
    if (!import.meta.client) {
      return { fcm_token: '', device_type: empty.device_type, device_id: empty.device_id }
    }

    try {
      const token = await resolveFirebaseMessagingTokenForLogin(10_000)
      if (!token) {
        console.warn('[Auth] login without FCM token (permission/SW/secure context — not account-related)')
        return { fcm_token: '', device_type: empty.device_type, device_id: empty.device_id }
      }
      return buildFcmDevicePayload(token)
    } catch (err) {
      console.warn('[Auth] failed to resolve FCM for login', err)
      return { fcm_token: '', device_type: empty.device_type, device_id: empty.device_id }
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

  async updateFcmToken(fcmToken: string): Promise<void> {
    const payload = buildFcmDevicePayload(fcmToken)
    console.log('[FCM] auth register payload', {
      fcm_token_preview: payload.fcm_token.slice(0, 16),
      device_type: payload.device_type,
      device_id: payload.device_id,
    })
    await this.api.updateFcmToken(payload)
  }
}

let authService: AuthService | null = null

export function getAuthService(): AuthService {
  if (!authService) {
    authService = new AuthService()
  }
  return authService
}
