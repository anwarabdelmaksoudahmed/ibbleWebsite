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
