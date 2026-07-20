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

export type WalletBankInfoApiDto = {
  account_name?: string | null
  bank_name?: string | null
  IBAN?: string | null
}

export type WalletDetailsApiDto = WalletApiDto & {
  user_id?: string | number | null
  total_withdraw?: string | number | null
  total_deposit?: string | number | null
  withdraw_count?: string | number | null
  deposit_count?: string | number | null
  pending_amount?: string | number | null
  bank_info?: WalletBankInfoApiDto | null
  activate_otb?: number | boolean | null
  created_at?: string | null
}

export type WalletTransactionDetailsApiDto = {
  orderId?: string | number | null
  [key: string]: unknown
}

export type WalletTransactionApiDto = {
  id: string | number
  user_id?: string | number | null
  model_type?: string | null
  model_id?: string | number | null
  amount?: string | number | null
  title?: string | null
  status?: string | null
  type?: string | null
  transaction_id?: string | number | null
  module?: string | null
  order_id?: string | number | null
  details?: WalletTransactionDetailsApiDto | null
  created_at?: string | null
  payment_method?: string | null
}

export type WalletTransactionsApiMeta = {
  totalItems?: number
  itemCount?: number
  itemsPerPage?: number
  totalPages?: number
  currentPage?: number
}

export type WalletTransactionsApiResponse = {
  data?: WalletTransactionApiDto[]
  meta?: WalletTransactionsApiMeta
}

export type WalletTransactionsQueryParams = {
  page?: number
  status?: string
  source?: WalletTransactionSource
}

export type WalletTransactionSource = 'wallet' | 'card'

export type CreateOrderApiRequest = {
  address_id: string
  store_id: string
  payment_method_id: string
  PIN_code?: string
  coupon_code?: string
}

export type WalletOrderApiResponse = {
  message: string
  invoice?: unknown | null
}

export type CardOrderApiResponse = {
  message: string
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

/** Card checkout returns HyperPay fields; wallet checkout returns message + invoice only. */
export type CreateOrderApiResponse = CardOrderApiResponse | WalletOrderApiResponse

export type CustomerOrderProductApiDto = {
  id: string | number
  qty?: string | number | null
  price?: string | number | null
  tax_amount?: string | number | null
  product_name?: string | null
  product_description?: string | null
  product_image?: string | null
  options?: unknown
  product?: {
    id?: string | number
    featured_image?: string | null
    price?: string | number | null
    [key: string]: unknown
  } | null
}

export type CustomerOrderStoreApiDto = {
  id?: string | number
  name?: string | null
  logo?: string | null
  url?: string | null
  city?: { id?: string | number; name?: string | null } | null
  country?: { id?: string | number; name?: string | null; flag?: string | null } | null
  category?: { id?: string | number; name?: string | null; slug?: string | null } | null
}

export type CustomerOrderAddressApiDto = {
  name?: string | null
  phone?: string | null
  country_code?: string | null
  email?: string | null
  address?: string | null
  country?: { id?: string | number; flag?: string | null; code?: string | null } | null
  city?: { id?: string | number; name?: string | null } | null
}

export type CustomerOrderApiDto = {
  id: string | number
  order_num?: string | null
  shipping_option?: string | null
  shipping_method?: string | null
  status?: string | null
  total_amount?: string | number | null
  tax_amount?: string | number | null
  shipping_amount?: string | number | null
  description?: string | null
  coupon_code?: string | null
  discount_amount?: string | number | null
  sub_total?: string | number | null
  is_confirmed?: number | boolean | null
  is_finished?: number | boolean | null
  invoice?: string | null
  payment_id?: string | number | null
  order_address?: CustomerOrderAddressApiDto | null
  created_at?: string | null
  store?: CustomerOrderStoreApiDto | null
  order_products?: CustomerOrderProductApiDto[] | null
}

export type CustomerOrdersApiMeta = {
  totalItems?: number
  itemCount?: number
  itemsPerPage?: number
  totalPages?: number
  currentPage?: number
}

export type CustomerOrdersApiResponse = {
  data?: CustomerOrderApiDto[]
  meta?: CustomerOrdersApiMeta
}

export type CustomerOrdersQueryParams = {
  page?: number
  status?: string
}
