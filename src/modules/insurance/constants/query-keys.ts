export const INSURANCE_QUERY_KEYS = {
  root: ['insurance'] as const,
  userList: (filters: {
    id?: string
    company?: string
    status?: string
    page: number
  }) =>
    [
      ...INSURANCE_QUERY_KEYS.root,
      'user-list',
      {
        id: filters.id?.trim() || '',
        company: filters.company || '',
        status: filters.status || '',
        page: filters.page,
      },
    ] as const,
} as const
