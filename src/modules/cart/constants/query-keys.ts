export const CART_QUERY_KEYS = {
  root: ['cart'] as const,
  list: () => [...CART_QUERY_KEYS.root, 'list'] as const,
}
