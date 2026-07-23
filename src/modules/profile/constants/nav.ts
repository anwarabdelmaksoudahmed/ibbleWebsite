import { PROFILE_ROUTES } from '@modules/profile/constants/routes'
import type { ProfileNavItem } from '@modules/profile/types'

export const PROFILE_SIDEBAR_NAV: ProfileNavItem[] = [
  {
    id: 'overview',
    icon: 'lucide:layout-dashboard',
    labelKey: 'site.profile.nav.overview',
    to: PROFILE_ROUTES.ROOT,
  },
  {
    id: 'wallet',
    icon: 'lucide:wallet',
    labelKey: 'site.profile.nav.wallet',
    to: PROFILE_ROUTES.WALLET,
  },
  {
    id: 'insurance',
    icon: 'lucide:shield-check',
    labelKey: 'site.profile.nav.insurance',
    to: PROFILE_ROUTES.INSURANCE,
  },
  {
    id: 'marketplace',
    icon: 'lucide:store',
    labelKey: 'site.profile.nav.marketplace',
    to: PROFILE_ROUTES.MARKETPLACE,
  },
  {
    id: 'transport',
    icon: 'lucide:truck',
    labelKey: 'site.profile.nav.transport',
    to: PROFILE_ROUTES.TRANSPORTATION,
  },
  {
    id: 'veterinary',
    icon: 'lucide:stethoscope',
    labelKey: 'site.profile.nav.veterinary',
    to: PROFILE_ROUTES.VETERINARY,
  },
  {
    id: 'favorites',
    icon: 'lucide:heart',
    labelKey: 'site.profile.nav.favorites',
    to: PROFILE_ROUTES.FAVOURITE,
  },
]
