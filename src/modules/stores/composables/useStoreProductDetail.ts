import { getStoresService } from '@modules/stores/services/stores.service'
import { normalizeApiError } from '@core/api/http/errors'

export function useStoreProductDetail(productId: MaybeRefOrGetter<string>) {
  const { locale } = useI18n()
  const resolvedId = computed(() => toValue(productId))

  const {
    data: product,
    pending,
    status,
    error,
    refresh,
  } = useAsyncData(
    () => ['store-product-detail', locale.value, resolvedId.value].join(':'),
    () => getStoresService().getProductById(resolvedId.value),
    {
      watch: [locale, resolvedId],
      default: () => null,
    },
  )

  const isLoading = computed(
    () => status.value === 'pending' || status.value === 'idle' || pending.value,
  )

  const errorMessage = computed(() => {
    if (!error.value) return null
    return normalizeApiError(error.value).message
  })

  const isNotFound = computed(() => {
    if (!error.value) return false
    return normalizeApiError(error.value).statusCode === 404
  })

  return {
    product,
    pending,
    isLoading,
    status,
    error,
    errorMessage,
    isNotFound,
    refresh,
  }
}
