/** Strip spaces and normalize IBAN casing. */
export function normalizeIban(value: string): string {
  return value.replace(/[\s-]+/g, '').toUpperCase()
}

/**
 * Format IBAN for display with groups of 4 characters.
 * Example: SA0380000000608010167519 → SA03 8000 0000 6080 1016 7519
 */
export function formatIbanDisplay(value: string): string {
  const normalized = normalizeIban(value)
  return normalized.replace(/(.{4})/g, '$1 ').trim()
}

/**
 * ISO 13616 IBAN MOD-97 check.
 * Optionally restrict to a country (e.g. `SA` for Saudi Arabia, length 24).
 */
export function isValidIban(value: string, countryCode?: string): boolean {
  const iban = normalizeIban(value)
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(iban)) return false
  if (iban.length < 15 || iban.length > 34) return false

  if (countryCode) {
    const code = countryCode.toUpperCase()
    if (!iban.startsWith(code)) return false
    if (code === 'SA' && iban.length !== 24) return false
  }

  const rearranged = iban.slice(4) + iban.slice(0, 4)
  let expanded = ''
  for (const char of rearranged) {
    const code = char.charCodeAt(0)
    expanded += code >= 65 ? String(code - 55) : char
  }

  let remainder = 0
  for (const digit of expanded) {
    remainder = (remainder * 10 + Number(digit)) % 97
  }

  return remainder === 1
}

/** Keep only IBAN-safe characters and cap length (ISO max 34). */
export function sanitizeIbanInput(value: string): string {
  return normalizeIban(value).replace(/[^A-Z0-9]/g, '').slice(0, 34)
}
