export const WISHLIST_ENDPOINTS = {
  BASE: '/v1/customer/wish-lists',
  BY_PRODUCT: (productId: string) => `/v1/customer/wish-lists/${productId}`,
} as const
