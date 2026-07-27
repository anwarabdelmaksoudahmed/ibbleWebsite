export const TRANSPORT_ENDPOINTS = {
  USER_TRIPS: '/trips/user',
  ALLOWED_VEHICLE_TYPES: '/allowed-vehicle-types',
  TRIP_REQUESTS: '/trip-requests',
  TRIP_REQUEST: (id: string | number) => `/trip-requests/${id}`,
  /** PATCH trip-requests/:id/cancel — cancel while waiting for drivers */
  TRIP_REQUEST_CANCEL: (id: string | number) => `/trip-requests/${id}/cancel`,
  OFFERS: '/offers',
  OFFER: (id: string | number) => `/offers/${id}`,
  /** Matches legacy: PATCH trips/:id/pay */
  TRIP_PAY: (id: string | number) => `/trips/${id}/pay`,
  /** Matches legacy: GET vehicles/:id */
  VEHICLE: (id: string | number) => `/vehicles/${id}`,
  /** Matches legacy website: PATCH users/fcm-token { fcm_token } */
  USER_FCM_TOKEN: '/users/fcm-token',
  /** Live offers stream: GET /sse/user/:userId/stream (Bearer auth) */
  USER_SSE_STREAM: (userId: string | number) => `/sse/user/${userId}/stream`,
} as const

/** Same IDs as marketplace / insurance (legacy transportation payment.vue). */
export const TRANSPORT_PAYMENT_METHOD_IDS = {
  card: 1,
  wallet: 2,
} as const

export type TransportPaymentMethodId = keyof typeof TRANSPORT_PAYMENT_METHOD_IDS
