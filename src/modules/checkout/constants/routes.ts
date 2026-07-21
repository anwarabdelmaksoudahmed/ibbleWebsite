export const CHECKOUT_ROUTES = {
  ROOT: '/checkout',
  forStore: (storeId: string) => ({
    path: '/checkout' as const,
    query: { storeId },
  }),
} as const
