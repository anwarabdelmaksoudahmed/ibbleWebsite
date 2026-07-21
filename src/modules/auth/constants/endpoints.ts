export const AUTH_ENDPOINTS = {
  SSO_LOGIN: '/sso-login',
  SSO_SIGNUP: '/sso-signup',
  /** TODO: Set when backend refresh endpoint is available */
  REFRESH: '/auth/refresh',
  /** TODO: Set when backend logout endpoint is available */
  LOGOUT: '/auth/logout',
  /** TODO: Set when backend current-user endpoint is available */
  ME: '/auth/me',
} as const

export const AUTH_ENDPOINT_FLAGS = {
  REFRESH_ENABLED: false,
  LOGOUT_ENABLED: false,
  CURRENT_USER_ENABLED: false,
} as const
