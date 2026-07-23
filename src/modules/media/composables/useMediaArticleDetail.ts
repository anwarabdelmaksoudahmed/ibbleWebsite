import { normalizeApiError } from '@core/api/http/errors'
import { getMediaService } from '@modules/media/services/media.service'
import type { MediaArticle } from '@modules/media/types'

export function useMediaArticleDetail(
  id: MaybeRefOrGetter<string>,
  kind: MaybeRefOrGetter<'news' | 'events'>,
) {
  const { locale } = useI18n()
  const resolvedId = computed(() => toValue(id))
  const resolvedKind = computed(() => toValue(kind))

  const { data, pending, status, error, refresh } = useAsyncData(
    () => ['media-article', resolvedKind.value, locale.value, resolvedId.value].join(':'),
    async () => {
      if (!resolvedId.value) return null
      const service = getMediaService()
      return resolvedKind.value === 'events'
        ? service.getEvent(resolvedId.value)
        : service.getNews(resolvedId.value)
    },
    {
      watch: [locale, resolvedId, resolvedKind],
      default: () => null as MediaArticle | null,
    },
  )

  const article = computed(() => data.value)
  const isLoading = computed(
    () => status.value === 'pending' || status.value === 'idle' || pending.value,
  )
  const errorMessage = computed(() => {
    if (!error.value) return null
    return normalizeApiError(error.value).message
  })

  return {
    article,
    isLoading,
    pending,
    status,
    error,
    errorMessage,
    refresh,
  }
}
