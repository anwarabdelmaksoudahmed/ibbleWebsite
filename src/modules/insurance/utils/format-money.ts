/**
 * Format an amount with the insurance register currency label (SAR / ر.س).
 * Guard against non-finite values so the UI never renders "NaN".
 */
export function formatInsuranceMoney(
  amount: number,
  currencyLabel: string,
  locale: string,
): string {
  const safe = Number.isFinite(amount) ? amount : 0
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-SA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(safe)

  return `${formatted} ${currencyLabel}`
}
