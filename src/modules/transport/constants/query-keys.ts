export const TRANSPORT_QUERY_KEYS = {
  root: ['transport'] as const,
  userTrips: (filters: Record<string, unknown> = {}) =>
    [...TRANSPORT_QUERY_KEYS.root, 'user-trips', filters] as const,
} as const
