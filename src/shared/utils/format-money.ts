/**
 * Format a numeric amount for display next to SaudiRiyalSymbol.
 * Does not append a currency label — use the SVG symbol component in the UI.
 */
export function formatMoneyAmount(amount: number, locale: string): string {
  const safe = Number.isFinite(amount) ? amount : 0
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-SA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    // numberingSystem: 'latn',
  }).format(safe)
}

/** @deprecated Prefer formatMoneyAmount + SaudiRiyalSymbol / MoneyAmount */
export function formatInsuranceMoney(
  amount: number,
  _currencyLabel: string,
  locale: string,
): string {
  return formatMoneyAmount(amount, locale)
}
