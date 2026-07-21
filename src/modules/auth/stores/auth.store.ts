import { defineStore } from 'pinia'
import type { AuthState, InternalAuthModel, LoginCredentials, RegisterCredentials, User } from '@modules/auth/types'
import { AuthService } from '@modules/auth/services/auth.service'
import { tokenManager } from '@modules/auth/utils/token-manager'
import { AuthEndpointNotAvailableError } from '@modules/auth/utils/errors'
import { ROUTES } from '@shared/constants/routes'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    sessionExpiresAt: null,
    refreshExpiresAt: null,
    roles: [],
    permissions: [],
    isAuthenticated: false,
    isLoading: false,
  }),

  getters: {
    currentUser: (state): User | null => state.user,
    userPermissions: (state) => state.permissions,
    roleNames: (state) => state.roles.map((role) => role.name),
    isSessionValid: (state): boolean => {
      if (!state.isAuthenticated || !state.sessionExpiresAt) return state.isAuthenticated
      return Date.now() < new Date(state.sessionExpiresAt).getTime()
    },
  },

  actions: {
    async login(credentials: LoginCredentials) {
      this.isLoading = true
      try {
        const authService = new AuthService()
        const authModel = await authService.login(credentials)
        this.applyAuthModel(authModel)
        tokenManager.setRememberMe(Boolean(credentials.remember))
        return authModel
      } finally {
        this.isLoading = false
      }
    },

    async register(credentials: RegisterCredentials) {
      this.isLoading = true
      try {
        const authService = new AuthService()
        return await authService.signup(credentials)
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        const authService = new AuthService()
        await authService.logout()
      } catch {
        // Local logout must always succeed even if remote logout is unavailable.
      } finally {
        this.clearSession()
        const localePath = useLocalePath()
        await navigateTo(localePath(ROUTES.AUTH.LOGIN))
      }
    },

    async refreshSession() {
      const storedRefreshToken = tokenManager.getRefreshToken()
      if (!storedRefreshToken) {
        throw new Error('No refresh token available')
      }

      const authService = new AuthService()
      const { session } = await authService.refreshToken(storedRefreshToken)
      this.applySession(session)
    },

    async loadCurrentUser() {
      if (!tokenManager.getAccessToken()) return

      if (tokenManager.isAccessTokenExpired()) {
        this.clearSession()
        return
      }

      this.isAuthenticated = true

      if (!this.user) {
        this.restoreIdentityFromStorage()
      }

      if (this.user) return

      try {
        const authService = new AuthService()
        this.user = await authService.getCurrentUser()
        if (this.user) {
          tokenManager.persistIdentity({
            user: this.user,
            roles: this.roles,
            permissions: this.permissions,
          })
        }
      } catch (error) {
        if (error instanceof AuthEndpointNotAvailableError) return
        this.clearSession()
      }
    },

    applyAuthModel(authModel: InternalAuthModel) {
      this.user = authModel.user
      this.roles = authModel.roles
      this.permissions = authModel.permissions
      this.applySession(authModel.session)
      this.isAuthenticated = true
      tokenManager.persistIdentity({
        user: authModel.user,
        roles: authModel.roles,
        permissions: authModel.permissions,
      })
    },

    applySession(session: InternalAuthModel['session']) {
      this.accessToken = session.accessToken.accessToken
      this.sessionExpiresAt = session.accessToken.expiresAt
      this.refreshToken = session.refreshToken?.token ?? null
      this.refreshExpiresAt = session.refreshToken?.expiresAt ?? null
      tokenManager.persistSession(session)
    },

    clearSession() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.sessionExpiresAt = null
      this.refreshExpiresAt = null
      this.roles = []
      this.permissions = []
      this.isAuthenticated = false
      tokenManager.clear()
    },

    hydrateFromStorage() {
      const persisted = tokenManager.readPersistedTokens()
      if (!persisted) {
        // Pinia may still have stale `isAuthenticated` from persist — clear it.
        if (this.isAuthenticated || this.accessToken) {
          this.clearSession()
        }
        return
      }

      if (tokenManager.isAccessTokenExpired()) {
        this.clearSession()
        return
      }

      this.accessToken = persisted.accessToken
      this.refreshToken = persisted.refreshToken
      this.sessionExpiresAt = persisted.sessionExpiresAt
      this.refreshExpiresAt = persisted.refreshExpiresAt
      this.isAuthenticated = true

      // Tokens restore immediately; user may still be missing if Pinia rehydrate raced.
      // Identity is stored next to tokens so the name is available without `/auth/me`.
      if (!this.user) {
        this.restoreIdentityFromStorage()
      } else {
        tokenManager.persistIdentity({
          user: this.user,
          roles: this.roles,
          permissions: this.permissions,
        })
      }
    },

    restoreIdentityFromStorage() {
      const identity = tokenManager.readPersistedIdentity()
      if (!identity) return

      this.user = identity.user
      this.roles = identity.roles
      this.permissions = identity.permissions
    },
  },

  persist: {
    pick: ['user', 'roles', 'permissions', 'sessionExpiresAt', 'refreshExpiresAt', 'isAuthenticated'],
  },
})
