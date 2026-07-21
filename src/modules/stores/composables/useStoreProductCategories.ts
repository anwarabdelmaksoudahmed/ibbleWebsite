import { getStoresService } from '@modules/stores/services/stores.service'
import { normalizeApiError } from '@core/api/http/errors'

export function useStoreProductCategories(slug: MaybeRefOrGetter<string>) {
  const { locale } = useI18n()
  const resolvedSlug = computed(() => toValue(slug))

  const {
    data: categories,
    pending,
    status,
    error,
    refresh,
  } = useAsyncData(
    () => ['store-product-categories', locale.value, resolvedSlug.value].join(':'),
    () => getStoresService().listStoreProductCategories(resolvedSlug.value),
    {
      watch: [locale, resolvedSlug],
      default: () => [],
    },
  )

  const isLoading = computed(
    () => status.value === 'pending' || status.value === 'idle' || pending.value,
  )

  const errorMessage = computed(() => {
    if (!error.value) return null
    return normalizeApiError(error.value).message
  })

  return {
    categories,
    pending,
    isLoading,
    status,
    error,
    errorMessage,
    refresh,
  }
}
