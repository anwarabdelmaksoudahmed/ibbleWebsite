export const STORES_ENDPOINTS = {
  CATEGORIES: '/v1/stores-categories',
  CATEGORY_BY_SLUG: (slug: string) => `/v1/stores-categories/${slug}`,
  CATEGORY_STORES: (slug: string) => `/v1/category/${slug}/stores`,
  BY_SLUG: (slug: string) => `/v1/stores/${slug}`,
  PRODUCT_CATEGORIES: (slug: string) => `/v1/${slug}/product-categories`,
  PRODUCTS: (slug: string) => `/v1/${slug}/products`,
  PRODUCT_BY_ID: (id: string) => `/v1/products/${id}`,
} as const
