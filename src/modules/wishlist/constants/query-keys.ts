export const WISHLIST_QUERY_KEYS = {
  root: ['wishlist'] as const,
  list: () => [...WISHLIST_QUERY_KEYS.root, 'list'] as const,
}
