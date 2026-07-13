export type CustomerAddressCountryApiDto = {
  id?: string | number
  flag?: string
  code?: string
  name?: string
}

export type CustomerAddressCityApiDto = {
  id?: string | number
  name?: string
}

export type CustomerAddressApiDto = {
  id: string | number
  name: string
  email?: string | null
  phone: string
  country_code?: string | null
  address: string
  is_default?: number | boolean | null
  zip_code?: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  country?: CustomerAddressCountryApiDto | null
  city?: CustomerAddressCityApiDto | null
  state?: unknown
}

export type CustomerAddressesApiResponse =
  | CustomerAddressApiDto[]
  | { data: CustomerAddressApiDto[] }

export type CreateCustomerAddressApiRequest = {
  name: string
  email?: string
  phone: string
  country_code: string
  address: string
  country_id: string
  city_id: string
  zip_code?: string
  is_default?: number
}

export type UpdateCustomerAddressApiRequest = Partial<CreateCustomerAddressApiRequest>

export type CityApiDto = {
  id: string | number
  name: string
  country: string | number
}

export type CitiesApiResponse = CityApiDto[] | { data: CityApiDto[] }

export type CountryApiDto = {
  id: string | number
  name: string
  flag?: string
  code?: string
}

export type CountriesApiResponse = CountryApiDto[] | { data: CountryApiDto[] }

export type WalletApiDto = {
  id?: string | number
  balance?: string | number | null
  currency?: string | null
  status?: string | null
  name?: string | null
  [key: string]: unknown
}

export type WalletsApiResponse =
  | WalletApiDto[]
  | { data: WalletApiDto[] | WalletApiDto }
  | WalletApiDto
