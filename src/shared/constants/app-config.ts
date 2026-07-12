export const APP_CONFIG = {
  NAME: 'Ibble',
  VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEBOUNCE_MS: 300,
  TOAST_DURATION_MS: 5000,
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  CURRENCY: 'USD',
  LOCALE: 'en-US',
  /** International format without + (e.g. 9665xxxxxxxx) */
  WHATSAPP_NUMBER: '966500000000',
} as const

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ibble_access_token',
  REFRESH_TOKEN: 'ibble_refresh_token',
  TOKEN_EXPIRY: 'ibble_token_expiry',
  USER_PREFERENCES: 'ibble_user_preferences',
} as const
