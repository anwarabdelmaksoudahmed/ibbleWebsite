export const CHECKOUT_QUERY_KEYS = {
  root: ['checkout'] as const,
  addresses: () => [...CHECKOUT_QUERY_KEYS.root, 'addresses'] as const,
  cities: (countryId?: string) =>
    [...CHECKOUT_QUERY_KEYS.root, 'cities', countryId ?? 'all'] as const,
  countries: () => [...CHECKOUT_QUERY_KEYS.root, 'countries'] as const,
  wallets: () => [...CHECKOUT_QUERY_KEYS.root, 'wallets'] as const,
  walletDetails: () => [...CHECKOUT_QUERY_KEYS.root, 'wallet-details'] as const,
  walletTransactions: (filters: {
    page?: number
    status?: string
    source?: string
  }) => [...CHECKOUT_QUERY_KEYS.root, 'wallet-transactions', filters] as const,
  customerOrders: (filters: { page?: number; status?: string }) =>
    [...CHECKOUT_QUERY_KEYS.root, 'customer-orders', filters] as const,
} as const
