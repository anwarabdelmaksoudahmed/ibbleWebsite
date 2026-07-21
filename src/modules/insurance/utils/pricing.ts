import type {
  InsurancePricingRate,
  InsuranceProviderOptions,
  InsuranceProviderQuote,
} from '@modules/insurance/types'

/**
 * `to === 0` means an open-ended upper bound (e.g. 300.01+).
 */
export function findMatchingPricingRate(
  rates: InsurancePricingRate[],
  amount: number,
): InsurancePricingRate | null {
  if (!Number.isFinite(amount) || amount < 0 || rates.length === 0) return null

  const sorted = [...rates].sort((a, b) => a.from - b.from)

  for (const rate of sorted) {
    const withinLower = amount >= rate.from
    const withinUpper = rate.to <= 0 || amount <= rate.to
    if (withinLower && withinUpper) return rate
  }

  return null
}

export function calculateCoverage(
  insuredAmount: number,
  rate: InsurancePricingRate | null,
): number {
  if (!rate || !Number.isFinite(insuredAmount)) return 0

  if (rate.type === 'percentage') {
    return roundMoney((insuredAmount * rate.price) / 100)
  }

  return roundMoney(rate.price)
}

export function buildProviderQuote(
  options: InsuranceProviderOptions,
  pricingRates: InsurancePricingRate[],
  insuredAmount: number,
): InsuranceProviderQuote {
  const amount = Number.isFinite(insuredAmount) ? Math.max(0, insuredAmount) : 0
  const rate = findMatchingPricingRate(pricingRates, amount)
  const coverage = calculateCoverage(amount, rate)
  const certificateFees = roundMoney(options.certificateFees)
  const taxPercent = options.taxPercent
  const vat = roundMoney(((coverage + certificateFees) * taxPercent) / 100)
  const total = roundMoney(coverage + certificateFees + vat)

  return {
    insuredAmount: amount,
    certificateFees,
    coverage,
    taxPercent,
    vat,
    total,
    deductiblePercent: options.deductiblePercent,
    minDeductible: options.minDeductible,
    rate,
  }
}

export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round(value * 100) / 100
}

/** Convert trip distance in km to whole meters for the insurance API. */
export function distanceKmToMeters(distanceKm: string | number): number {
  const km = typeof distanceKm === 'number' ? distanceKm : Number(distanceKm)
  if (!Number.isFinite(km) || km <= 0) return 0
  return Math.round(km * 1000)
}
