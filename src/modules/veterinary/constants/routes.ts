export const VETERINARY_ROUTES = {
  ROOT: '/services/veterinary',
  BOOK: '/veterinary/book',
} as const

export const VETERINARY_BOOKING_STEPS = [
  'serviceType',
  'doctor',
  'appointment',
  'payment',
] as const

export type VeterinaryBookingStep = (typeof VETERINARY_BOOKING_STEPS)[number]

export const VETERINARY_SERVICE_TYPES = [
  { id: 'clinic', icon: 'lucide:stethoscope' },
  { id: 'fieldVisit', icon: 'lucide:home' },
] as const

export type VeterinaryServiceTypeId = (typeof VETERINARY_SERVICE_TYPES)[number]['id']

export const VETERINARY_DOCTOR_SORT_OPTIONS = [
  'default',
  'priceAsc',
  'priceDesc',
  'nameAsc',
] as const

export type VeterinaryDoctorSortId = (typeof VETERINARY_DOCTOR_SORT_OPTIONS)[number]
