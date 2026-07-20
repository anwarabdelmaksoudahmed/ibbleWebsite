export const TRANSPORT_ROUTES = {
  ROOT: '/transport',
  REGISTER: '/transport/register-transportation',
} as const

export const TRANSPORT_REGISTER_STEPS = ['delivery', 'shipmentType', 'payment'] as const

export type TransportRegisterStep = (typeof TRANSPORT_REGISTER_STEPS)[number]

export const TRANSPORT_SHIPMENT_TYPES = [
  {
    id: 'small',
    icon: 'lucide:truck',
  },
  {
    id: 'medium',
    icon: 'lucide:truck',
  },
  {
    id: 'large',
    icon: 'lucide:container',
  },
] as const

export type TransportShipmentTypeId = (typeof TRANSPORT_SHIPMENT_TYPES)[number]['id']
