import type { InsuranceServiceProviderApiDto } from '@modules/insurance/types/api.types'

export type InsurancePricingRate = {
  id: number
  from: number
  to: number
  price: number
  type: 'percentage' | 'fixed'
}

export type InsuranceProviderOptions = {
  /** Deductible percentage of the insured amount */
  deductiblePercent: number
  /** Minimum deductible amount in SAR */
  minDeductible: number
  certificateFees: number
  /** VAT percentage */
  taxPercent: number
}

export type InsuranceProviderQuote = {
  insuredAmount: number
  certificateFees: number
  /** Land transport coverage / premium before VAT */
  coverage: number
  taxPercent: number
  vat: number
  total: number
  deductiblePercent: number
  minDeductible: number
  rate: InsurancePricingRate | null
}

export type InsuranceServiceProvider = {
  id: number
  name: string
  image: string
  isActive: boolean
  options: InsuranceProviderOptions
  termsAndConditions: string
  pricingRates: InsurancePricingRate[]
  quote: InsuranceProviderQuote
  /** Original API DTO — required when posting `selectedCompany` on create. */
  raw: InsuranceServiceProviderApiDto
}
