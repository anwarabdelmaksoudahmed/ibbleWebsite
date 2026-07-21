export type CheckChipNumberApiResponse = {
  data: boolean
}

export type InsurancePricingRateApiDto = {
  id: number
  from: string
  to: string
  price: string
  type: 'percentage' | 'fixed' | string
  created_at: string
  updated_at: string
}

export type InsuranceProviderOptionsApiDto = {
  mount: number
  min_mount: number
  certificate_fees: number
  tax: number
}

export type InsuranceServiceProviderApiDto = {
  id: number
  name: string
  doc: string | null
  image: string
  is_active: boolean
  options: InsuranceProviderOptionsApiDto
  termsAndConditions: string
  created_at: string
  updated_at: string
  pricingRate: InsurancePricingRateApiDto[]
}

export type InsuranceServiceProvidersMetaApiDto = {
  itemCount: number
  totalPages: number
  currentPage: number
  itemsPerPage: string | number
  startItemInPage: number
}

export type InsuranceServiceProvidersApiResponse = {
  data: InsuranceServiceProviderApiDto[]
  meta: InsuranceServiceProvidersMetaApiDto
}

export type InsuranceServiceProvidersQueryParams = {
  limit?: number
  distance: number
  totalPrice: number
}

export type CreateInsuranceCamelApiDto = {
  chip_number: string
  value: string
  status: string
  color: string
}

export type CreateInsuranceApiRequest = {
  country_code: string
  national_id: string
  phone: string
  email: string
  address: string
  full_name: string
  camels: CreateInsuranceCamelApiDto[]
  startText: string
  endText: string
  /** Trip distance in meters. */
  distance: number
  date: string
  /** Total insured cargo value (SAR). */
  totalFeesPackages: number
  selectedCompany: InsuranceServiceProviderApiDto
  service_provider_id: number
  iban: string
  payment_method_id: number
  /** Required for wallet payments. */
  PIN_code?: string
}

/** Wallet (and some success) responses return the created insurance record. */
export type CreateInsuranceRecordApiResponse = {
  id?: number
  message?: string
  full_name?: string
  total_price?: number
  invoice?: string | null
  policies?: string | null
  fees_details?: {
    total_insurance_price?: number
    certificate_fees?: number
    transportaion_coverage?: number
    tax_fees?: number
    total?: number
  }
  [key: string]: unknown
}

/**
 * Card payments return HyperPay initiation fields (same shape as marketplace checkout).
 */
export type CreateInsuranceCardApiResponse = {
  message?: string
  amount: number
  currency: string
  payment_type: string
  merchant_transaction_id: number | string
  description: string
  module: string
  payment_method_id: number | string
  address: {
    customer_email: string
    country: string
    state: string
    street1: string
    postcode: string
    first_name: string
    last_name: string
  }
  invoice?: unknown | null
}

export type CreateInsuranceApiResponse =
  | CreateInsuranceCardApiResponse
  | CreateInsuranceRecordApiResponse

export type UserInsuranceFeesApiDto = {
  total_insurance_price: number
  certificate_fees: number
  transportaion_coverage: number
  tax_fees: number
  total: number
}

export type UserInsuranceProviderApiDto = {
  id: number
  name: string
  doc: string | null
  image: string
  is_active: boolean
  options: InsuranceProviderOptionsApiDto
  termsAndConditions: string
  created_at: string
  updated_at: string
}

export type UserInsuranceApiDto = {
  id: number
  full_name: string
  address: string
  phone: string
  email: string
  date: string
  distance: number
  iban: string
  doc: string | null
  total_price: number
  user_id: number
  national_id: string
  transportation_coverage: number
  invoice: string | null
  policies: string | null
  fees_details: UserInsuranceFeesApiDto
  created_at: string
  updated_at: string
  service_provider: UserInsuranceProviderApiDto
}

export type UserInsurancesMetaApiDto = {
  itemCount: number
  totalPages: number
  currentPage: string | number
  itemsPerPage: string | number
  startItemInPage: number
}

export type UserInsurancesApiResponse = {
  count: number
  meta: UserInsurancesMetaApiDto
  data: UserInsuranceApiDto[]
}

export type UserInsurancesQueryParams = {
  id?: string
  company?: string
  status?: string
  page?: number
}
