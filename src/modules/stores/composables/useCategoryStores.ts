import { getStoresService } from '@modules/stores/services/stores.service'
import { normalizeApiError } from '@core/api/http/errors'
import type { CategoryStoresQueryParams } from '@modules/stores/types'

export function useCategoryStores(slug: MaybeRefOrGetter<string>) {
  const { locale } = useI18n()

  const country = ref('')
  const city = ref('')
  const order = ref<'ASC' | 'DESC'>('DESC')
  const page = ref(1)
  const limit = ref(10)

  const appliedCountry = ref('')
  const appliedCity = ref('')
  const appliedOrder = ref<'ASC' | 'DESC'>('DESC')

  const resolvedSlug = computed(() => toValue(slug))

  const {
    data,
    pending,
    status,
    error,
    refresh,
  } = useAsyncData(
    () =>
      [
        'category-stores',
        locale.value,
        resolvedSlug.value,
        appliedCountry.value,
        appliedCity.value,
        appliedOrder.value,
        page.value,
        limit.value,
      ].join(':'),
    () => {
      const params: CategoryStoresQueryParams = {
        country: appliedCountry.value,
        city: appliedCity.value,
        order: appliedOrder.value,
        page: page.value,
        limit: limit.value,
      }
      return getStoresService().listCategoryStores(resolvedSlug.value, params)
    },
    {
      watch: [locale, resolvedSlug, appliedCountry, appliedCity, appliedOrder, page, limit],
      default: () => ({
        stores: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
        categoryName: '',
      }),
    },
  )

  const stores = computed(() => data.value?.stores ?? [])
  const meta = computed(() => data.value?.meta)
  const categoryName = computed(() => data.value?.categoryName ?? '')
  const totalPages = computed(() => meta.value?.totalPages || 1)

  /** True until the request settles (success or error). */
  const isLoading = computed(
    () => status.value === 'pending' || status.value === 'idle' || pending.value,
  )

  const errorMessage = computed(() => {
    if (!error.value) return null
    return normalizeApiError(error.value).message
  })

  function applyFilters() {
    appliedCountry.value = country.value
    appliedCity.value = city.value
    appliedOrder.value = order.value
    page.value = 1
  }

  function setPage(next: number) {
    page.value = Math.max(1, next)
  }

  return {
    stores,
    meta,
    categoryName,
    pending,
    isLoading,
    status,
    error,
    errorMessage,
    refresh,
    country,
    city,
    order,
    page,
    limit,
    totalPages,
    applyFilters,
    setPage,
  }
}
