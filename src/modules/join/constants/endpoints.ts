/**
 * Join (provider onboarding) endpoints.
 * Each path is resolved against its own service base URL — see `JoinApi`.
 */
export const JOIN_ENDPOINTS = {
  /** `{MARKETPLACE}` */
  MERCHANT_REGISTER: '/merchant/register',
  /** `{TRANSPORTATION}` */
  DRIVERS: '/drivers',
  /** `{TRANSPORTATION}` */
  COMPANIES: '/companies',
  /** `{VETERINARY}` */
  DOCTORS_REGISTER: '/doctors/register',
  /** `{VETERINARY}` */
  CLINICS_REGISTER: '/clinics/register',

  /** `{MARKETPLACE}` lookups used by the merchant form */
  CITIES: '/v1/cities',
  STORE_CATEGORIES: '/v1/stores-categories',
} as const
