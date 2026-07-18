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

export type UserInsuranceStatus = 'active' | 'expired'

export type UserInsuranceFees = {
  insuredAmount: number
  certificateFees: number
  transportationCoverage: number
  taxFees: number
  total: number
}

export type UserInsuranceProvider = {
  id: number
  name: string
  image: string
  isActive: boolean
}

export type UserInsurance = {
  id: number
  fullName: string
  address: string
  phone: string
  email: string
  /** Coverage date (YYYY-MM-DD). */
  date: string
  distanceMeters: number
  iban: string
  totalPrice: number
  nationalId: string
  transportationCoverage: number
  invoiceUrl: string | null
  policiesUrl: string | null
  fees: UserInsuranceFees
  createdAt: string
  updatedAt: string
  provider: UserInsuranceProvider
  status: UserInsuranceStatus
}

export type UserInsurancesPage = {
  items: UserInsurance[]
  count: number
  totalPages: number
  currentPage: number
  itemsPerPage: number
}
