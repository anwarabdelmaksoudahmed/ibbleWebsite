import type { InternalAxiosRequestConfig } from 'axios'

const LOCALE_COOKIE_KEY = 'ibble-locale'
const DEFAULT_LOCALE = 'ar'

/**
 * Resolve the app UI locale for API content negotiation.
 * Must override the browser's automatic Accept-Language on client XHR,
 * otherwise marketplace content arrives in the browser OS language.
 */
export function resolveApiLocale(): string {
  try {
    const nuxtApp = useNuxtApp()
    const i18n = nuxtApp.$i18n as { locale?: { value?: string } } | undefined
    const fromI18n = i18n?.locale?.value
    if (fromI18n === 'ar' || fromI18n === 'en') return fromI18n
  } catch {
    // Outside Nuxt context (rare) — fall through to cookie / default
  }

  try {
    const cookie = useCookie<string | null>(LOCALE_COOKIE_KEY)
    if (cookie.value === 'ar' || cookie.value === 'en') return cookie.value
  } catch {
    // useCookie unavailable
  }

  return DEFAULT_LOCALE
}

export function applyAcceptLanguageHeader(config: InternalAxiosRequestConfig): void {
  const override = config.apiLocale
  const locale =
    override === 'ar' || override === 'en' ? override : resolveApiLocale()
  config.headers.set('Accept-Language', locale)
}
