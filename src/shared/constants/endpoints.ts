export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
  PRODUCTS: {
    BASE: '/products',
    BY_ID: (id: string) => `/products/${id}`,
  },
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
  },
  CUSTOMERS: {
    BASE: '/customers',
    BY_ID: (id: string) => `/customers/${id}`,
  },
  SETTINGS: {
    BASE: '/settings',
    PROFILE: '/settings/profile',
    PREFERENCES: '/settings/preferences',
  },
  STORES: {
    CATEGORIES: '/v1/stores-categories',
    CATEGORY_BY_SLUG: (slug: string) => `/v1/stores-categories/${slug}`,
    CATEGORY_STORES: (slug: string) => `/v1/category/${slug}/stores`,
    BY_SLUG: (slug: string) => `/v1/stores/${slug}`,
    PRODUCT_CATEGORIES: (slug: string) => `/v1/${slug}/product-categories`,
    PRODUCTS: (slug: string) => `/v1/${slug}/products`,
  },
} as const

