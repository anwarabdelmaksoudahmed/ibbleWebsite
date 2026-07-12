import { getStoresService } from '@modules/stores/services/stores.service'
import { normalizeApiError } from '@core/api/http/errors'

export function useStoreProfile(slug: MaybeRefOrGetter<string>) {
  const { locale } = useI18n()
  const resolvedSlug = computed(() => toValue(slug))

  const {
    data: store,
    pending,
    status,
    error,
    refresh,
  } = useAsyncData(
    () => ['store-profile', locale.value, resolvedSlug.value].join(':'),
    () => getStoresService().getStoreBySlug(resolvedSlug.value),
    {
      watch: [locale, resolvedSlug],
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

  const isServerError = computed(() => {
    if (!error.value || isNotFound.value) return false
    return normalizeApiError(error.value).statusCode >= 500
  })

  return {
    store,
    pending,
    isLoading,
    status,
    error,
    errorMessage,
    isNotFound,
    isServerError,
    refresh,
  }
}
