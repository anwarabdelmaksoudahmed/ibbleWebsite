import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { AUTH_ENDPOINTS, AUTH_ENDPOINT_FLAGS } from '@modules/auth/constants/endpoints'
import { AuthEndpointNotAvailableError } from '@modules/auth/utils/errors'
import type {
  CurrentUserApiResponse,
  LoginApiRequest,
  LoginApiResponse,
  LoginApiUserDto,
  RefreshTokenApiResponse,
  SignupApiRequest,
  SignupApiResponse,
  UpdateFcmTokenApiPayload,
} from '@modules/auth/types/api.types'

export class AuthApi {
  private readonly client: AxiosInstance
  private readonly baseUrl: string

  constructor(baseUrl: string, client?: AxiosInstance) {
    this.client = client ?? getHttpClient()
    this.baseUrl = baseUrl
  }

  login(payload: LoginApiRequest): Promise<LoginApiResponse> {
    return this.client
      .post<LoginApiResponse>(AUTH_ENDPOINTS.SSO_LOGIN, payload, {
        baseURL: this.baseUrl,
        skipAuth: true,
      })
      .then((response) => response.data)
  }

  signup(payload: SignupApiRequest): Promise<SignupApiResponse> {
    return this.client
      .post<SignupApiResponse>(AUTH_ENDPOINTS.SSO_SIGNUP, payload, {
        baseURL: this.baseUrl,
        skipAuth: true,
      })
      .then((response) => response.data)
  }

  logout(): Promise<void> {
    if (!AUTH_ENDPOINT_FLAGS.LOGOUT_ENABLED) {
      return Promise.reject(new AuthEndpointNotAvailableError('logout'))
    }

    return this.client
      .post<void>(AUTH_ENDPOINTS.LOGOUT, undefined, { baseURL: this.baseUrl })
      .then(() => undefined)
  }

  refreshToken(refreshToken: string): Promise<RefreshTokenApiResponse> {
    if (!AUTH_ENDPOINT_FLAGS.REFRESH_ENABLED) {
      return Promise.reject(new AuthEndpointNotAvailableError('refreshToken'))
    }

    return this.client
      .post<RefreshTokenApiResponse>(
        AUTH_ENDPOINTS.REFRESH,
        { refresh_token: refreshToken },
        { baseURL: this.baseUrl, skipAuth: true },
      )
      .then((response) => response.data)
  }

  getCurrentUser(): Promise<LoginApiUserDto> {
    if (!AUTH_ENDPOINT_FLAGS.CURRENT_USER_ENABLED) {
      return Promise.reject(new AuthEndpointNotAvailableError('getCurrentUser'))
    }

    return this.client
      .get<CurrentUserApiResponse>(AUTH_ENDPOINTS.ME, { baseURL: this.baseUrl })
      .then((response) => {
        const payload = response.data
        return 'data' in payload ? payload.data : payload
      })
  }

  /** PATCH /v1/fcm-tokens { fcm_token, device_type, device_id } */
  updateFcmToken(payload: UpdateFcmTokenApiPayload): Promise<unknown> {
    return this.client
      .patch(AUTH_ENDPOINTS.FCM_TOKENS, payload, {
        baseURL: this.baseUrl,
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }
}
