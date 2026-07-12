import { StoresService } from '@modules/stores/services/stores.service'
import { normalizeApiError } from '@core/api/http/errors'

let storesService: StoresService | null = null

function getStoresService(): StoresService {
  if (!storesService) {
    storesService = new StoresService()
  }
  return storesService
}

export function useStoreCategories() {
  const { locale } = useI18n()

  const {
    data: categories,
    pending,
    error,
    refresh,
  } = useAsyncData(
    () => `store-categories-${locale.value}`,
    () => getStoresService().listCategories(),
    {
      default: () => [],
      watch: [locale],
    },
  )

  const errorMessage = computed(() => {
    if (!error.value) return null
    return normalizeApiError(error.value).message
  })

  return {
    categories,
    pending,
    error,
    errorMessage,
    refresh,
  }
}
