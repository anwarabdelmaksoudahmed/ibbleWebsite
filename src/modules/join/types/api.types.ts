/** Merchant — POST {MARKETPLACE}/merchant/register */
export type JoinMerchantApiRequest = {
  name: string
  phone: string
  country_code: string
  national_id: string
  store_type_id: string
  store_name_ar: string
  store_name_en: string
  city_id: string
  address: string
}

/** Independent driver — POST {TRANSPORTATION}/drivers */
export type JoinDriverApiRequest = {
  name: string
  phone: string
  country_code: string
  national_id: string
  commission_approved: boolean
}

/** Shipping company — POST {TRANSPORTATION}/companies */
export type JoinCompanyApiRequest = {
  name: string
  address: string
  owner_name: string
  phone: string
  country_code: string
  national_id: string
  commission_approved: boolean
}

/** Independent doctor — POST {VETERINARY}/doctors/register */
export type JoinDoctorApiRequest = {
  name: string
  email: string
  phone: string
  country_code: string
  other_phone?: string
  national_id: string
  commission_approved: boolean
}

/** Clinic — POST {VETERINARY}/clinics/register */
export type JoinClinicApiRequest = {
  name: string
  owner_name: string
  email: string
  phone: string
  country_code: string
  other_phone?: string
  national_id: string
  commission_approved: boolean
}

export type JoinApiResponse = {
  message?: string
  data?: unknown
}

/** Marketplace lookups */
export type JoinCityApiDto = {
  id: number | string
  name?: string
  country?: number | string
}

export type JoinStoreCategoryApiDto = {
  id: number | string
  name?: string
  slug?: string
}

export type JoinCitiesApiResponse = JoinCityApiDto[] | { data?: JoinCityApiDto[] }
export type JoinStoreCategoriesApiResponse =
  | JoinStoreCategoryApiDto[]
  | { data?: JoinStoreCategoryApiDto[] }
