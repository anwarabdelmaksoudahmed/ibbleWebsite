import { normalizeApiError } from '@core/api/http/errors'
import type { MediaListResult, MediaPaginationMeta } from '@modules/media/types'

const EMPTY_META: MediaPaginationMeta = {
  totalItems: 0,
  itemCount: 0,
  itemsPerPage: 12,
  totalPages: 1,
  currentPage: 1,
}

export function useMediaPaginatedList<T>(options: {
  keyPrefix: string
  fetcher: (params: { page: number; limit: number }) => Promise<MediaListResult<T>>
  limit?: number
}) {
  const { locale } = useI18n()
  const page = ref(1)
  const limit = ref(options.limit ?? 12)

  const { data, pending, status, error, refresh } = useAsyncData(
    () => [options.keyPrefix, locale.value, page.value, limit.value].join(':'),
    () =>
      options.fetcher({
        page: page.value,
        limit: limit.value,
      }),
    {
      watch: [locale, page, limit],
      default: () => ({
        items: [] as T[],
        meta: { ...EMPTY_META, itemsPerPage: limit.value },
      }),
    },
  )

  const items = computed(() => data.value?.items ?? [])
  const meta = computed(() => data.value?.meta ?? EMPTY_META)
  const totalPages = computed(() => meta.value.totalPages || 1)
  const hasItems = computed(() => items.value.length > 0)

  const isLoading = computed(
    () => status.value === 'pending' || status.value === 'idle' || pending.value,
  )

  const errorMessage = computed(() => {
    if (!error.value) return null
    return normalizeApiError(error.value).message
  })

  function setPage(next: number) {
    page.value = Math.max(1, next)
  }

  return {
    items,
    meta,
    page,
    limit,
    totalPages,
    hasItems,
    pending,
    isLoading,
    status,
    error,
    errorMessage,
    refresh,
    setPage,
  }
}
