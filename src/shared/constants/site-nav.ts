import { ROUTES } from '@shared/constants/routes'

export type SiteNavItem = {
  key: string
  to: string
  icon?: string
}

export const SITE_TOP_LINKS: SiteNavItem[] = [
  { key: 'site.nav.home', to: ROUTES.HOME },
  { key: 'site.nav.about', to: ROUTES.ABOUT },
  { key: 'site.nav.contact', to: ROUTES.CONTACT },
]

export const SITE_SERVICE_LINKS: SiteNavItem[] = [
  { key: 'site.nav.stores', to: '/stores', icon: 'lucide:store' },
  { key: 'site.nav.insurance', to: ROUTES.INSURANCE, icon: 'lucide:heart-handshake' },
  { key: 'site.nav.transport', to: ROUTES.TRANSPORT, icon: 'lucide:truck' },
  { key: 'site.nav.veterinary', to: '/services/veterinary', icon: 'lucide:stethoscope' },
  { key: 'site.nav.permits', to: '/services/permits', icon: 'lucide:shield-check' },
  { key: 'site.nav.services', to: ROUTES.SERVICES, icon: 'lucide:briefcase' },
  { key: 'site.nav.media', to: '/media', icon: 'lucide:newspaper' },
]

/** Core services shown on the home page (avoids redundant “all services” entry). */
export const HOME_SERVICE_LINKS: SiteNavItem[] = [
  { key: 'site.nav.stores', to: '/stores', icon: 'lucide:store' },
  { key: 'site.nav.insurance', to: ROUTES.INSURANCE, icon: 'lucide:heart-handshake' },
  { key: 'site.nav.transport', to: ROUTES.TRANSPORT, icon: 'lucide:truck' },
  { key: 'site.nav.veterinary', to: '/services/veterinary', icon: 'lucide:stethoscope' },
  { key: 'site.nav.permits', to: '/services/permits', icon: 'lucide:shield-check' },
  { key: 'site.nav.media', to: '/media', icon: 'lucide:newspaper' },
]

export const SITE_FOOTER_STORES = [
  { key: 'site.footer.camelStores', to: '/stores/camel' },
  { key: 'site.footer.fodderStores', to: '/stores/feed' },
  { key: 'site.footer.productStores', to: '/stores/camel_products' },
  { key: 'site.footer.supplies', to: '/stores/camel_supplies' },
]

export const SITE_FOOTER_SERVICES = [
  { key: 'site.nav.permits', to: '/services/permits' },
  { key: 'site.nav.insurance', to: ROUTES.INSURANCE },
  { key: 'site.nav.transport', to: ROUTES.TRANSPORT },
  { key: 'site.nav.veterinary', to: '/services/veterinary' },
]

export const SITE_FOOTER_POLICIES = [
  { key: 'site.footer.terms', to: '/terms' },
  { key: 'site.footer.privacy', to: '/privacy' },
]
