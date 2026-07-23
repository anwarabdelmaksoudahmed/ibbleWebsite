import { getMediaService } from '@modules/media/services/media.service'
import { useMediaPaginatedList } from '@modules/media/composables/useMediaPaginatedList'

export function useMediaImageGalleries(limit = 12) {
  return useMediaPaginatedList({
    keyPrefix: 'media-image-galleries',
    limit,
    fetcher: (params) => getMediaService().listImageGalleries(params),
  })
}
