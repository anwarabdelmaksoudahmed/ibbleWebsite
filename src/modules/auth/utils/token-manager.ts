import { AUTH_STORAGE_KEYS } from '@modules/auth/constants/storage-keys'
import type { Permission, Role, Session, User } from '@modules/auth/types'

const isClient = import.meta.client

export type PersistedTokens = {
  accessToken: string
  refreshToken: string | null
  sessionExpiresAt: string | null
  refreshExpiresAt: string | null
}

export type PersistedAuthIdentity = {
  user: User
  roles: Role[]
  permissions: Permission[]
}

function parseIdentity(raw: string): PersistedAuthIdentity | null {
  try {
    const parsed = JSON.parse(raw) as PersistedAuthIdentity
    if (!parsed?.user?.id || typeof parsed.user.name !== 'string') return null
    return {
      user: parsed.user,
      roles: Array.isArray(parsed.roles) ? parsed.roles : [],
      permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
    }
  } catch {
    return null
  }
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

  persistIdentity(identity: PersistedAuthIdentity): void {
    if (!isClient) return
    localStorage.setItem(AUTH_STORAGE_KEYS.IDENTITY, JSON.stringify(identity))
  },

  readPersistedIdentity(): PersistedAuthIdentity | null {
    if (!isClient) return null
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.IDENTITY)
    if (raw) {
      const identity = parseIdentity(raw)
      if (identity) return identity
    }

    // Migrate from Pinia persist blob written by older sessions.
    const piniaRaw = localStorage.getItem('auth')
    if (!piniaRaw) return null
    const fromPinia = parseIdentity(piniaRaw)
    if (fromPinia) {
      this.persistIdentity(fromPinia)
      return fromPinia
    }
    return null
  },

  clearIdentity(): void {
    if (!isClient) return
    localStorage.removeItem(AUTH_STORAGE_KEYS.IDENTITY)
  },

  clear(): void {
    if (!isClient) return
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_EXPIRES_AT)
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_EXPIRES_AT)
    localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME)
    this.clearIdentity()
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
