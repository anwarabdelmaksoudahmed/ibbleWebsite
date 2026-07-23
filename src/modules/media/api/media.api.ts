import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { getHttpClient } from '@core/api/http/client'
import { MEDIA_ENDPOINTS } from '@modules/media/constants/endpoints'
import type {
  MediaArticleApiDto,
  MediaGalleryApiDto,
  MediaItemApiResponse,
  MediaListQueryParams,
  MediaPaginatedApiResponse,
} from '@modules/media/types/api.types'

type MediaRequestOptions = {
  apiLocale?: string
  signal?: AbortSignal
}

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

  private requestConfig(options?: MediaRequestOptions): AxiosRequestConfig {
    return {
      baseURL: this.baseUrl,
      skipErrorToast: true,
      ...(options?.apiLocale ? { apiLocale: options.apiLocale } : {}),
      ...(options?.signal ? { signal: options.signal } : {}),
    }
  }

  listNews(
    params: MediaListQueryParams = {},
    options?: MediaRequestOptions,
  ): Promise<MediaPaginatedApiResponse<MediaArticleApiDto>> {
    return this.client
      .get<MediaPaginatedApiResponse<MediaArticleApiDto>>(MEDIA_ENDPOINTS.NEWS, {
        ...this.requestConfig(options),
        params: this.listParams(params),
      })
      .then((response) => response.data)
  }

  getNews(
    id: string,
    options?: MediaRequestOptions,
  ): Promise<MediaItemApiResponse<MediaArticleApiDto> | MediaArticleApiDto> {
    return this.client
      .get<MediaItemApiResponse<MediaArticleApiDto> | MediaArticleApiDto>(
        MEDIA_ENDPOINTS.NEWS_BY_ID(id),
        this.requestConfig(options),
      )
      .then((response) => response.data)
  }

  listEvents(
    params: MediaListQueryParams = {},
    options?: MediaRequestOptions,
  ): Promise<MediaPaginatedApiResponse<MediaArticleApiDto>> {
    return this.client
      .get<MediaPaginatedApiResponse<MediaArticleApiDto>>(MEDIA_ENDPOINTS.EVENTS, {
        ...this.requestConfig(options),
        params: this.listParams(params),
      })
      .then((response) => response.data)
  }

  getEvent(
    id: string,
    options?: MediaRequestOptions,
  ): Promise<MediaItemApiResponse<MediaArticleApiDto> | MediaArticleApiDto> {
    return this.client
      .get<MediaItemApiResponse<MediaArticleApiDto> | MediaArticleApiDto>(
        MEDIA_ENDPOINTS.EVENTS_BY_ID(id),
        this.requestConfig(options),
      )
      .then((response) => response.data)
  }

  listImageGalleries(
    params: MediaListQueryParams = {},
    options?: MediaRequestOptions,
  ): Promise<MediaPaginatedApiResponse<MediaGalleryApiDto>> {
    return this.client
      .get<MediaPaginatedApiResponse<MediaGalleryApiDto>>(MEDIA_ENDPOINTS.IMAGE_GALLERIES, {
        ...this.requestConfig(options),
        params: this.listParams(params),
      })
      .then((response) => response.data)
  }

  getImageGallery(
    id: string,
    options?: MediaRequestOptions,
  ): Promise<MediaItemApiResponse<MediaGalleryApiDto> | MediaGalleryApiDto> {
    return this.client
      .get<MediaItemApiResponse<MediaGalleryApiDto> | MediaGalleryApiDto>(
        MEDIA_ENDPOINTS.IMAGE_GALLERY_BY_ID(id),
        this.requestConfig(options),
      )
      .then((response) => response.data)
  }

  listVideoGalleries(
    params: MediaListQueryParams = {},
    options?: MediaRequestOptions,
  ): Promise<MediaPaginatedApiResponse<MediaGalleryApiDto>> {
    return this.client
      .get<MediaPaginatedApiResponse<MediaGalleryApiDto>>(MEDIA_ENDPOINTS.VIDEO_GALLERIES, {
        ...this.requestConfig(options),
        params: this.listParams(params),
      })
      .then((response) => response.data)
  }

  getVideoGallery(
    id: string,
    options?: MediaRequestOptions,
  ): Promise<MediaItemApiResponse<MediaGalleryApiDto> | MediaGalleryApiDto> {
    return this.client
      .get<MediaItemApiResponse<MediaGalleryApiDto> | MediaGalleryApiDto>(
        MEDIA_ENDPOINTS.VIDEO_GALLERY_BY_ID(id),
        this.requestConfig(options),
      )
      .then((response) => response.data)
  }
}
