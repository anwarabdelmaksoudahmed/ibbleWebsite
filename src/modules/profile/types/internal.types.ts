export type ProfileStatKey =
  | 'orders'
  | 'favorites'
  | 'wallet'
  | 'insurance'
  | 'transportation'
  | 'veterinary'
  | 'marketplace'
  | 'bookings'

export type ProfileStat = {
  key: ProfileStatKey
  icon: string
  value: number | null
  accent: 'green' | 'gold' | 'neutral'
}

export type ProfileNavItem = {
  id: string
  icon: string
  labelKey: string
  to: string
}

export type ProfileBreadcrumbItem = {
  label: string
  to?: string
}

