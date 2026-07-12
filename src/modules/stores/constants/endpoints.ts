export const STORES_ENDPOINTS = {
  CATEGORIES: '/v1/stores-categories',
  CATEGORY_BY_SLUG: (slug: string) => `/v1/stores-categories/${slug}`,
} as const
