import { ROUTES } from '@shared/constants/routes'

export type ServicesHubItemKey =
  | 'stores'
  | 'insurance'
  | 'transport'
  | 'veterinary'
  | 'permits'

export type ServicesHubItem = {
  key: ServicesHubItemKey
  to: string
  icon: string
  image: string
  width: number
  height: number
}

/** Core platform services shown on the /services hub (with dedicated imagery). */
export const SERVICES_HUB_ITEMS: ServicesHubItem[] = [
  {
    key: 'stores',
    to: ROUTES.STORES.ROOT,
    icon: 'lucide:store',
    image: '/images/services/stores.jpg',
    width: 1024,
    height: 630,
  },
  {
    key: 'insurance',
    to: ROUTES.INSURANCE,
    icon: 'lucide:heart-handshake',
    image: '/images/services/insurance.jpg',
    width: 1024,
    height: 630,
  },
  {
    key: 'transport',
    to: ROUTES.TRANSPORT,
    icon: 'lucide:truck',
    image: '/images/services/transport.jpg',
    width: 1024,
    height: 630,
  },
  {
    key: 'veterinary',
    to: '/services/veterinary',
    icon: 'lucide:stethoscope',
    image: '/images/services/veterinary.jpg',
    width: 1024,
    height: 630,
  },
  {
    key: 'permits',
    to: '/services/permits',
    icon: 'lucide:shield-check',
    image: '/images/services/permits.jpg',
    width: 1024,
    height: 630,
  },
]

export const SERVICES_HUB_HERO = {
  src: '/images/services/transport.jpg',
  width: 1024,
  height: 630,
} as const

export const SERVICES_HUB_HOW_IMAGE = {
  src: '/images/services/how-to-apply.jpg',
  width: 1024,
  height: 682,
} as const

export const SERVICES_HUB_STEPS = [
  { key: 'choose', icon: 'lucide:layout-grid' },
  { key: 'request', icon: 'lucide:clipboard-list' },
  { key: 'track', icon: 'lucide:badge-check' },
] as const
