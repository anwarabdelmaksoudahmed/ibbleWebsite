export const VETERINARY_QUERY_KEYS = {
  root: ['veterinary'] as const,
  customerReservations: (filters: Record<string, unknown> = {}) =>
    [...VETERINARY_QUERY_KEYS.root, 'customer-reservations', filters] as const,
  doctors: (filters: Record<string, unknown> = {}) =>
    [...VETERINARY_QUERY_KEYS.root, 'doctors', filters] as const,
  reservedTimes: (doctorId: string, day: string, date: string) =>
    [...VETERINARY_QUERY_KEYS.root, 'reserved-times', doctorId, day, date] as const,
} as const
