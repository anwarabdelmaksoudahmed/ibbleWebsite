import { AuthApi } from '@modules/auth/api/auth.api'
import type { InternalAuthModel, LoginApiRequest, LoginCredentials, User } from '@modules/auth/types'
import {
  mapCurrentUserApiResponse,
  mapLoginApiResponse,
  mapRefreshTokenApiResponse,
} from '@modules/auth/utils/mappers'
import { AuthEndpointNotAvailableError, resolveAuthError } from '@modules/auth/utils/errors'

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
