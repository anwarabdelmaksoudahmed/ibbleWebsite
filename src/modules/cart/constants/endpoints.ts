export const CART_ENDPOINTS = {
  BASE: '/v1/carts',
  /** DELETE `/v1/carts/:productId` — removes a product line from the cart. */
  byProductId: (productId: string) => `/v1/carts/${encodeURIComponent(productId)}`,
} as const
