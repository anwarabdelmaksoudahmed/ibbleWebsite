import { resolveApiLocale } from '@core/api/http/locale'

/** Marketplace content often omits EN rows / fails when translations are missing. */
export const CONTENT_FALLBACK_LOCALE = 'ar' as const

export function shouldRetryWithContentFallback(): boolean {
  return resolveApiLocale() !== CONTENT_FALLBACK_LOCALE
}

export function isAuthBlockedStatus(statusCode?: number): boolean {
  return statusCode === 401 || statusCode === 403
}
