import { AUTH_STORAGE_KEYS } from '@modules/auth/constants/storage-keys'
import type { Session } from '@modules/auth/types'

const isClient = import.meta.client

export type PersistedTokens = {
  accessToken: string
  refreshToken: string | null
  sessionExpiresAt: string | null
  refreshExpiresAt: string | null
}

export const tokenManager = {
  getAccessToken(): string | null {
    if (!isClient) return null
    return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
  },

  getRefreshToken(): string | null {
    if (!isClient) return null
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
  },

  getSessionExpiresAt(): string | null {
    if (!isClient) return null
    return localStorage.getItem(AUTH_STORAGE_KEYS.SESSION_EXPIRES_AT)
  },

  getRefreshExpiresAt(): string | null {
    if (!isClient) return null
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_EXPIRES_AT)
  },

  persistSession(session: Session): void {
    if (!isClient) return

    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, session.accessToken.accessToken)

    if (session.accessToken.expiresAt) {
      localStorage.setItem(AUTH_STORAGE_KEYS.SESSION_EXPIRES_AT, session.accessToken.expiresAt)
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_EXPIRES_AT)
    }

    if (session.refreshToken?.token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, session.refreshToken.token)
      if (session.refreshToken.expiresAt) {
        localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_EXPIRES_AT, session.refreshToken.expiresAt)
      }
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_EXPIRES_AT)
    }
  },

  readPersistedTokens(): PersistedTokens | null {
    const accessToken = this.getAccessToken()
    if (!accessToken) return null

    return {
      accessToken,
      refreshToken: this.getRefreshToken(),
      sessionExpiresAt: this.getSessionExpiresAt(),
      refreshExpiresAt: this.getRefreshExpiresAt(),
    }
  },

  clear(): void {
    if (!isClient) return
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_EXPIRES_AT)
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_EXPIRES_AT)
    localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME)
  },

  isAccessTokenExpired(): boolean {
    if (!isClient) return true
    const expiresAt = this.getSessionExpiresAt()
    if (!expiresAt) return false
    return Date.now() >= new Date(expiresAt).getTime() - 30_000
  },

  isRefreshTokenExpired(): boolean {
    if (!isClient) return true
    const expiresAt = this.getRefreshExpiresAt()
    if (!expiresAt) return false
    return Date.now() >= new Date(expiresAt).getTime() - 30_000
  },

  setRememberMe(remember: boolean): void {
    if (!isClient) return
    if (remember) {
      localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBER_ME, 'true')
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME)
    }
  },

  getRememberMe(): boolean {
    if (!isClient) return false
    return localStorage.getItem(AUTH_STORAGE_KEYS.REMEMBER_ME) === 'true'
  },
}
