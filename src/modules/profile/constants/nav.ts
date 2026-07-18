import { ROUTES } from '@shared/constants/routes'
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
    id: 'insurance',
    icon: 'lucide:shield-check',
    labelKey: 'site.profile.nav.insurance',
    to: PROFILE_ROUTES.INSURANCE,
  },
  {
    id: 'marketplace',
    icon: 'lucide:store',
    labelKey: 'site.profile.nav.marketplace',
    to: ROUTES.STORES.ROOT,
  },
  {
    id: 'transport',
    icon: 'lucide:truck',
    labelKey: 'site.profile.nav.transport',
    to: '/services/transport',
  },
  {
    id: 'veterinary',
    icon: 'lucide:stethoscope',
    labelKey: 'site.profile.nav.veterinary',
    to: '/services/veterinary',
  },
  {
    id: 'favorites',
    icon: 'lucide:heart',
    labelKey: 'site.profile.nav.favorites',
    to: ROUTES.STORES.ROOT,
  },
]
