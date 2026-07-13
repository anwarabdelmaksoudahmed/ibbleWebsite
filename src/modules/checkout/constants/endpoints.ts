export const CHECKOUT_ENDPOINTS = {
  ADDRESSES: '/v1/customer-addresses',
  ADDRESS_BY_ID: (id: string) => `/v1/customer-addresses/${encodeURIComponent(id)}`,
  CITIES: '/v1/cities',
  COUNTRIES: '/v1/countries',
  /** User wallets live on the web API host (`webApiBaseUrl`). */
  WALLETS: '/v1/user/wallets',
} as const
