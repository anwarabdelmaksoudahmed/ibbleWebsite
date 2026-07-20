export const VETERINARY_QUERY_KEYS = {
  root: ['veterinary'] as const,
  customerReservations: (filters: { page?: number; status?: string }) =>
    [...VETERINARY_QUERY_KEYS.root, 'customer-reservations', filters] as const,
} as const
