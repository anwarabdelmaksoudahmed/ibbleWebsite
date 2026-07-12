export const ROUTES = {
  HOME: '/',
  STORES: {
    ROOT: '/stores',
    CATEGORY: (slug: string) => `/stores/${encodeURIComponent(slug)}`,
    STORE: (categorySlug: string, storeSlug: string) =>
      `/stores/${encodeURIComponent(categorySlug)}/${encodeURIComponent(storeSlug)}`,
  },
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products/create',
    DETAIL: (id: string) => `/products/${id}`,
    EDIT: (id: string) => `/products/${id}/edit`,
  },
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
  },
  CUSTOMERS: {
    LIST: '/customers',
    DETAIL: (id: string) => `/customers/${id}`,
  },
  SETTINGS: {
    ROOT: '/settings',
    PROFILE: '/settings/profile',
    PREFERENCES: '/settings/preferences',
    SECURITY: '/settings/security',
  },
} as const

export const GUEST_ROUTES = [
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.REGISTER,
  ROUTES.AUTH.FORGOT_PASSWORD,
  ROUTES.AUTH.RESET_PASSWORD,
] as const

export const PROTECTED_ROUTE_PREFIXES = [
  '/products',
  '/orders',
  '/customers',
  '/settings',
] as const
