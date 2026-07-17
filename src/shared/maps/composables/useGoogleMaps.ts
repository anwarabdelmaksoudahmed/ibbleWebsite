import {
  createGoogleMapsService,
  GoogleMapsService,
} from '@shared/maps/services/google-maps.service'
import { DEFAULT_COUNTRY, DEFAULT_MAP_CENTER, DEFAULT_REGION } from '@shared/maps/constants/defaults'
import { formatDistanceKm } from '@shared/maps/utils/formatters'

export function useGoogleMaps(options?: {
  country?: string
  region?: string
}) {
  const runtimeConfig = useRuntimeConfig()
  const { locale } = useI18n()

  const apiKey = computed(() => String(runtimeConfig.public.googleMapsApiKey || ''))
  const isReady = ref(false)
  const isLoading = ref(false)
  const loadError = ref(false)

  const service = computed<GoogleMapsService | null>(() => {
    if (!apiKey.value) return null
    return createGoogleMapsService({
      apiKey: apiKey.value,
      language: locale.value === 'ar' ? 'ar' : 'en',
      region: options?.region ?? DEFAULT_REGION,
      country: options?.country ?? DEFAULT_COUNTRY,
      defaultCenter: DEFAULT_MAP_CENTER,
    })
  })

  async function ensureLoaded(): Promise<GoogleMapsService | null> {
    if (!import.meta.client) return null

    const mapsService = service.value
    if (!mapsService) {
      loadError.value = true
      isReady.value = false
      return null
    }

    if (mapsService.isReady()) {
      isReady.value = true
      loadError.value = false
      return mapsService
    }

    isLoading.value = true
    loadError.value = false

    try {
      await mapsService.ensureLoaded()
      isReady.value = true
      return mapsService
    } catch {
      loadError.value = true
      isReady.value = false
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    apiKey,
    service,
    isReady,
    isLoading,
    loadError,
    ensureLoaded,
    formatDistanceKm,
    defaultCenter: DEFAULT_MAP_CENTER,
  }
}
