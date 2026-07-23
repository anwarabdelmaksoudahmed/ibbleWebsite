import { getMediaService } from '@modules/media/services/media.service'
import { useMediaPaginatedList } from '@modules/media/composables/useMediaPaginatedList'

export function useMediaNews(limit = 12) {
  return useMediaPaginatedList({
    keyPrefix: 'media-news',
    limit,
    fetcher: (params) => getMediaService().listNews(params),
  })
}
