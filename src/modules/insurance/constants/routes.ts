export const INSURANCE_ROUTES = {
  ROOT: '/insurance',
  REGISTER: '/insurance/register-insurance',
} as const

export const INSURANCE_REGISTER_STEPS = [
  'customer',
  'shipment',
  'pricing',
  'payment',
] as const

export type InsuranceRegisterStep = (typeof INSURANCE_REGISTER_STEPS)[number]
