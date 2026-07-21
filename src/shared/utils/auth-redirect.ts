import { GUEST_ROUTES } from '@shared/constants/routes'
import { pathMatchesPrefix } from '@shared/utils/locale-path'

/**
 * Resolve a post-login / post-auth redirect target.
 * Only allows same-origin relative paths to prevent open redirects.
 */
export function resolveAuthRedirect(redirect: unknown, fallback: string): string {
  if (typeof redirect !== 'string') return fallback

  const target = redirect.trim()
  if (!target.startsWith('/') || target.startsWith('//')) return fallback
  if (target.includes('://')) return fallback

  // Never bounce authenticated users back onto guest-only auth screens.
  if (GUEST_ROUTES.some((route) => pathMatchesPrefix(target, route))) {
    return fallback
  }

  return target
}
