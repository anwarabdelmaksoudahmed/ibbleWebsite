import { getStoresService } from '@modules/stores/services/stores.service'
import { normalizeApiError } from '@core/api/http/errors'
import type { StoreProductsQueryParams } from '@modules/stores/types'

export function useStoreProducts(slug: MaybeRefOrGetter<string>) {
  const { locale } = useI18n()

  const categoryId = ref('')
  const page = ref(1)
  const limit = ref(12)

  const resolvedSlug = computed(() => toValue(slug))

  // Category ids are locale-agnostic, but clear filter on language switch so
  // a stale selection never masks the content-fallback retry.
  watch(locale, () => {
    categoryId.value = ''
    page.value = 1
  })

  const {
    data,
    pending,
    status,
    error,
    refresh,
  } = useAsyncData(
    () =>
      [
        'store-products',
        locale.value,
        resolvedSlug.value,
        categoryId.value,
        page.value,
        limit.value,
      ].join(':'),
    () => {
      const params: StoreProductsQueryParams = {
        page: page.value,
        limit: limit.value,
        ...(categoryId.value ? { category: categoryId.value } : {}),
      }
      return getStoresService().listStoreProducts(resolvedSlug.value, params)
    },
    {
      watch: [locale, resolvedSlug, categoryId, page, limit],
      default: () => ({
        products: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: 12,
          totalPages: 1,
          currentPage: 1,
        },
      }),
    },
  )

  const products = computed(() => data.value?.products ?? [])
  const meta = computed(() => data.value?.meta)
  const totalPages = computed(() => meta.value?.totalPages || 1)

  const isLoading = computed(
    () => status.value === 'pending' || status.value === 'idle' || pending.value,
  )

  const errorMessage = computed(() => {
    if (!error.value) return null
    return normalizeApiError(error.value).message
  })

  function setCategory(next: string) {
    categoryId.value = next
    page.value = 1
  }

  function setPage(next: number) {
    page.value = Math.max(1, next)
  }

  return {
    products,
    meta,
    pending,
    isLoading,
    status,
    error,
    errorMessage,
    refresh,
    categoryId,
    page,
    limit,
    totalPages,
    setCategory,
    setPage,
  }
}
