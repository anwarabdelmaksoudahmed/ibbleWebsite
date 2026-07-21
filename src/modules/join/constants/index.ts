export { JOIN_ENDPOINTS } from './endpoints'

/** Top-level service the provider joins. */
export const JOIN_SERVICES = ['marketplace', 'transportation', 'veterinary'] as const
export type JoinService = (typeof JOIN_SERVICES)[number]

/** Concrete provider type submitted to the backend. */
export const JOIN_PROVIDER_TYPES = ['merchant', 'driver', 'company', 'doctor', 'clinic'] as const
export type JoinProviderType = (typeof JOIN_PROVIDER_TYPES)[number]

/** Provider types available under each service (order = display order). */
export const JOIN_SERVICE_PROVIDER_TYPES: Record<JoinService, readonly JoinProviderType[]> = {
  marketplace: ['merchant'],
  transportation: ['driver', 'company'],
  veterinary: ['doctor', 'clinic'],
} as const

/** Platform commission (%) the provider agrees to on each order/booking. */
export const JOIN_COMMISSION_RATES: Partial<Record<JoinProviderType, number>> = {
  driver: 5,
  company: 10,
  doctor: 15,
  clinic: 10,
} as const

export const JOIN_SERVICE_ICONS: Record<JoinService, string> = {
  marketplace: 'lucide:store',
  transportation: 'lucide:truck',
  veterinary: 'lucide:stethoscope',
} as const

export const JOIN_PROVIDER_TYPE_ICONS: Record<JoinProviderType, string> = {
  merchant: 'lucide:store',
  driver: 'lucide:car-front',
  company: 'lucide:building-2',
  doctor: 'lucide:user-round',
  clinic: 'lucide:hospital',
} as const

export const JOIN_QUERY_KEYS = {
  cities: () => ['join', 'cities'] as const,
  storeCategories: () => ['join', 'store-categories'] as const,
} as const
