export const TRANSPORT_ENDPOINTS = {
  USER_TRIPS: '/trips/user',
  ALLOWED_VEHICLE_TYPES: '/allowed-vehicle-types',
  TRIP_REQUESTS: '/trip-requests',
  TRIP_REQUEST: (id: string | number) => `/trip-requests/${id}`,
  OFFERS: '/offers',
  OFFER: (id: string | number) => `/offers/${id}`,
  /** Matches legacy website: PATCH users/fcm-token { fcm_token } */
  USER_FCM_TOKEN: '/users/fcm-token',
} as const
