export const TRANSPORT_ROUTES = {
  ROOT: '/transport',
  REGISTER: '/transport/register-transportation',
  REQUEST: (id: string | number) => `/transport/requests/${id}`,
} as const

export const TRANSPORT_REGISTER_STEPS = ['delivery', 'shipmentType', 'payment'] as const

export type TransportRegisterStep = (typeof TRANSPORT_REGISTER_STEPS)[number]
