export const CHECKOUT_ENDPOINTS = {
  ADDRESSES: '/v1/customer-addresses',
  ADDRESS_BY_ID: (id: string) => `/v1/customer-addresses/${encodeURIComponent(id)}`,
  CITIES: '/v1/cities',
  COUNTRIES: '/v1/countries',
  ORDERS: '/v1/customer/orders',
  /** User wallets live on the web API host (`webApiBaseUrl`). */
  WALLETS: '/v1/user/wallets',
  WALLET_TRANSACTIONS: '/v1/user/wallets/transactions',
  WALLET_CREDIT_TRANSACTIONS: '/v1/user/wallets/credit-transactions',
} as const
