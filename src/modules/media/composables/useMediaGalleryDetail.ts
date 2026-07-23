import { normalizeApiError } from '@core/api/http/errors'
import { getMediaService } from '@modules/media/services/media.service'
import type { MediaGallery } from '@modules/media/types'

export function useMediaGalleryDetail(
  id: MaybeRefOrGetter<string>,
  kind: MaybeRefOrGetter<'image' | 'video'>,
) {
  const { locale } = useI18n()
  const resolvedId = computed(() => toValue(id))
  const resolvedKind = computed(() => toValue(kind))

  const { data, pending, status, error, refresh } = useAsyncData(
    () => ['media-gallery', resolvedKind.value, locale.value, resolvedId.value].join(':'),
    async () => {
      if (!resolvedId.value) return null
      const service = getMediaService()
      return resolvedKind.value === 'video'
        ? service.getVideoGallery(resolvedId.value)
        : service.getImageGallery(resolvedId.value)
    },
    {
      watch: [locale, resolvedId, resolvedKind],
      default: () => null as MediaGallery | null,
    },
  )

  const gallery = computed(() => data.value)
  const isLoading = computed(
    () => status.value === 'pending' || status.value === 'idle' || pending.value,
  )
  const errorMessage = computed(() => {
    if (!error.value) return null
    return normalizeApiError(error.value).message
  })

  return {
    gallery,
    isLoading,
    pending,
    status,
    error,
    errorMessage,
    refresh,
  }
}
