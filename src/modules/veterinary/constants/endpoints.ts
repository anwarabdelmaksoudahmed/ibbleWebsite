export const VETERINARY_ENDPOINTS = {
  /** List the authenticated customer's veterinary reservations. */
  CUSTOMER_RESERVATIONS: '/v1/customer/reservations',
  CUSTOMER_DOCTORS: '/v1/customer/doctors',
  RESERVED_TIMES: (doctorId: string) =>
    `/v1/customer/reservations/reserved-times/${encodeURIComponent(doctorId)}`,
} as const
