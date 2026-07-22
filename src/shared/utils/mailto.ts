export type MailtoOptions = {
  to: string
  subject?: string
  body?: string
  cc?: string
  bcc?: string
}

/**
 * Builds a safe `mailto:` URL. Returns `null` when `to` is empty.
 * Uses `encodeURIComponent` (not URLSearchParams) so spaces stay as `%20`
 * — more reliable across desktop/mobile mail clients.
 */
export function buildMailtoHref(options: MailtoOptions): string | null {
  const to = options.to.trim()
  if (!to) return null

  const parts: string[] = []

  if (options.subject?.trim()) {
    parts.push(`subject=${encodeURIComponent(options.subject.trim())}`)
  }
  if (options.body?.trim()) {
    parts.push(`body=${encodeURIComponent(options.body.trim())}`)
  }
  if (options.cc?.trim()) {
    parts.push(`cc=${encodeURIComponent(options.cc.trim())}`)
  }
  if (options.bcc?.trim()) {
    parts.push(`bcc=${encodeURIComponent(options.bcc.trim())}`)
  }

  return parts.length ? `mailto:${to}?${parts.join('&')}` : `mailto:${to}`
}

/**
 * Opens the user's default mail client.
 * Uses a temporary anchor (more reliable than `window.open` for mailto).
 */
export function openMailto(href: string): boolean {
  if (!import.meta.client || !href.startsWith('mailto:')) return false

  const anchor = document.createElement('a')
  anchor.href = href
  anchor.rel = 'noopener noreferrer'
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  return true
}
