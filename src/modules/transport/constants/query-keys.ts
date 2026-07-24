export const TRANSPORT_QUERY_KEYS = {
  root: ['transport'] as const,
  userTrips: (filters: Record<string, unknown> = {}) =>
    [...TRANSPORT_QUERY_KEYS.root, 'user-trips', filters] as const,
  vehicleTypes: (locale: string) =>
    [...TRANSPORT_QUERY_KEYS.root, 'vehicle-types', locale] as const,
  tripRequest: (id: string) =>
    [...TRANSPORT_QUERY_KEYS.root, 'trip-request', id] as const,
  offers: (tripRequestId: string) =>
    [...TRANSPORT_QUERY_KEYS.root, 'offers', tripRequestId] as const,
} as const
