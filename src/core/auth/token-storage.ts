import type { Session } from '@modules/auth/types'
import { tokenManager } from '@modules/auth/utils/token-manager'

export type StoredSession = {
  accessToken: string
  expiresAt: string | null
  refreshToken?: string | null
  refreshExpiresAt?: string | null
}

/** Core facade — components must never access tokens directly; use auth store/composable instead. */
export const tokenStorage = {
  getAccessToken: (): string | null => tokenManager.getAccessToken(),

  getRefreshToken: (): string | null => tokenManager.getRefreshToken(),

  getSessionExpiresAt: (): string | null => tokenManager.getSessionExpiresAt(),

  getRefreshExpiresAt: (): string | null => tokenManager.getRefreshExpiresAt(),

  setSession(session: StoredSession): void {
    const authSession: Session = {
      accessToken: {
        accessToken: session.accessToken,
        expiresAt: session.expiresAt,
        expiresIn: null,
      },
      refreshToken: session.refreshToken
        ? {
            token: session.refreshToken,
            expiresAt: session.refreshExpiresAt ?? null,
            expiresIn: null,
          }
        : null,
    }
    tokenManager.persistSession(authSession)
  },

  setTokens(tokens: StoredSession): void {
    this.setSession(tokens)
  },

  clearSession: (): void => tokenManager.clear(),

  clearTokens: (): void => tokenManager.clear(),

  isSessionExpired: (): boolean => tokenManager.isAccessTokenExpired(),

  isRefreshTokenExpired: (): boolean => tokenManager.isRefreshTokenExpired(),

  setRememberMe: (remember: boolean): void => tokenManager.setRememberMe(remember),

  getRememberMe: (): boolean => tokenManager.getRememberMe(),
}
