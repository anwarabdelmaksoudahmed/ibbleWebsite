/**
 * Locale-aware path helpers for @nuxtjs/i18n.
 * Use with NuxtLinkLocale / useLocalePath so English stays on /en/... routes.
 */

/** Strip locale prefix for route matching (e.g. /en/auth/login -> /auth/login) */
export function stripLocalePrefix(path: string, locales: string[] = ['ar', 'en']): string {
  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) return '/'

  const first = segments[0]
  if (first && locales.includes(first)) {
    const rest = segments.slice(1).join('/')
    return rest ? `/${rest}` : '/'
  }

  return path.startsWith('/') ? path : `/${path}`
}

export function pathMatchesPrefix(currentPath: string, prefix: string, locales?: string[]): boolean {
  const normalized = stripLocalePrefix(currentPath, locales)
  if (prefix === '/') return normalized === '/'
  return normalized === prefix || normalized.startsWith(`${prefix}/`)
}
