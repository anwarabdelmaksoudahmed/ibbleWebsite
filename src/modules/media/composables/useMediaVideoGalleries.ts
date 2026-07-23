import { getMediaService } from '@modules/media/services/media.service'
import { useMediaPaginatedList } from '@modules/media/composables/useMediaPaginatedList'

export function useMediaVideoGalleries(limit = 12) {
  return useMediaPaginatedList({
    keyPrefix: 'media-video-galleries',
    limit,
    fetcher: (params) => getMediaService().listVideoGalleries(params),
  })
}
