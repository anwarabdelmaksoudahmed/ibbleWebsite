export const INSURANCE_ENDPOINTS = {
  /** Check whether a camel chip / serial number exists. */
  FIND_BY_CHIP_NUMBER: (serial: string) =>
    `camel/findbychipnumber/${encodeURIComponent(serial)}`,
  /** List active insurance service providers with pricing for a trip. */
  SERVICE_PROVIDERS: 'insuranceServiceProvider',
} as const
