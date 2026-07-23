import { getMediaService } from '@modules/media/services/media.service'
import { useMediaPaginatedList } from '@modules/media/composables/useMediaPaginatedList'

export function useMediaEvents(limit = 12) {
  return useMediaPaginatedList({
    keyPrefix: 'media-events',
    limit,
    fetcher: (params) => getMediaService().listEvents(params),
  })
}
