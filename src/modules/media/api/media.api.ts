import type { AxiosInstance } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { MEDIA_ENDPOINTS } from '@modules/media/constants/endpoints'
import type {
  MediaArticleApiDto,
  MediaGalleryApiDto,
  MediaItemApiResponse,
  MediaListQueryParams,
  MediaPaginatedApiResponse,
} from '@modules/media/types/api.types'

export class MediaApi {
  private readonly client: AxiosInstance
  private readonly baseUrl: string

  constructor(baseUrl: string, client?: AxiosInstance) {
    this.client = client ?? getHttpClient()
    this.baseUrl = baseUrl
  }

  private listParams(params: MediaListQueryParams = {}) {
    return {
      page: params.page ?? 1,
      limit: params.limit ?? 12,
    }
  }

  listNews(params: MediaListQueryParams = {}): Promise<MediaPaginatedApiResponse<MediaArticleApiDto>> {
    return this.client
      .get<MediaPaginatedApiResponse<MediaArticleApiDto>>(MEDIA_ENDPOINTS.NEWS, {
        baseURL: this.baseUrl,
        params: this.listParams(params),
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  getNews(id: string): Promise<MediaItemApiResponse<MediaArticleApiDto> | MediaArticleApiDto> {
    return this.client
      .get<MediaItemApiResponse<MediaArticleApiDto> | MediaArticleApiDto>(
        MEDIA_ENDPOINTS.NEWS_BY_ID(id),
        {
          baseURL: this.baseUrl,
          skipErrorToast: true,
        },
      )
      .then((response) => response.data)
  }

  listEvents(
    params: MediaListQueryParams = {},
  ): Promise<MediaPaginatedApiResponse<MediaArticleApiDto>> {
    return this.client
      .get<MediaPaginatedApiResponse<MediaArticleApiDto>>(MEDIA_ENDPOINTS.EVENTS, {
        baseURL: this.baseUrl,
        params: this.listParams(params),
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  getEvent(id: string): Promise<MediaItemApiResponse<MediaArticleApiDto> | MediaArticleApiDto> {
    return this.client
      .get<MediaItemApiResponse<MediaArticleApiDto> | MediaArticleApiDto>(
        MEDIA_ENDPOINTS.EVENTS_BY_ID(id),
        {
          baseURL: this.baseUrl,
          skipErrorToast: true,
        },
      )
      .then((response) => response.data)
  }

  listImageGalleries(
    params: MediaListQueryParams = {},
  ): Promise<MediaPaginatedApiResponse<MediaGalleryApiDto>> {
    return this.client
      .get<MediaPaginatedApiResponse<MediaGalleryApiDto>>(MEDIA_ENDPOINTS.IMAGE_GALLERIES, {
        baseURL: this.baseUrl,
        params: this.listParams(params),
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  getImageGallery(
    id: string,
  ): Promise<MediaItemApiResponse<MediaGalleryApiDto> | MediaGalleryApiDto> {
    return this.client
      .get<MediaItemApiResponse<MediaGalleryApiDto> | MediaGalleryApiDto>(
        MEDIA_ENDPOINTS.IMAGE_GALLERY_BY_ID(id),
        {
          baseURL: this.baseUrl,
          skipErrorToast: true,
        },
      )
      .then((response) => response.data)
  }

  listVideoGalleries(
    params: MediaListQueryParams = {},
  ): Promise<MediaPaginatedApiResponse<MediaGalleryApiDto>> {
    return this.client
      .get<MediaPaginatedApiResponse<MediaGalleryApiDto>>(MEDIA_ENDPOINTS.VIDEO_GALLERIES, {
        baseURL: this.baseUrl,
        params: this.listParams(params),
        skipErrorToast: true,
      })
      .then((response) => response.data)
  }

  getVideoGallery(
    id: string,
  ): Promise<MediaItemApiResponse<MediaGalleryApiDto> | MediaGalleryApiDto> {
    return this.client
      .get<MediaItemApiResponse<MediaGalleryApiDto> | MediaGalleryApiDto>(
        MEDIA_ENDPOINTS.VIDEO_GALLERY_BY_ID(id),
        {
          baseURL: this.baseUrl,
          skipErrorToast: true,
        },
      )
      .then((response) => response.data)
  }
}
