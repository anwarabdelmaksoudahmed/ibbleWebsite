import { isApiError, normalizeApiError } from '@core/api/http/errors'
import {
  CONTENT_FALLBACK_LOCALE,
  shouldRetryWithContentFallback,
} from '@core/api/http/content-locale'
import { MediaApi } from '@modules/media/api/media.api'
import type { MediaListQueryParams } from '@modules/media/types/api.types'
import type { MediaArticle, MediaGallery, MediaListResult } from '@modules/media/types'
import {
  mapMediaArticle,
  mapMediaArticlesResponse,
  mapMediaGalleriesResponse,
  mapMediaGallery,
} from '@modules/media/utils/mappers'
import type {
  MediaArticleApiDto,
  MediaGalleryApiDto,
  MediaItemApiResponse,
  MediaPaginatedApiResponse,
} from '@modules/media/types/api.types'

function unwrapItem<T>(response: MediaItemApiResponse<T> | T): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as MediaItemApiResponse<T>).data
  }
  return response as T
}

/**
 * Website CMS often returns empty `data` for EN while meta still reports items
 * (missing translations) — same pattern as marketplace stores products.
 */
async function withEmptyListFallback<TItem, TResult extends { items: unknown[]; meta: { totalItems: number } }>(
  request: (apiLocale?: string) => Promise<MediaPaginatedApiResponse<TItem>>,
  map: (response: MediaPaginatedApiResponse<TItem>) => TResult,
): Promise<TResult> {
  const response = await request()
  const mapped = map(response)

  if (
    mapped.items.length === 0 &&
    mapped.meta.totalItems > 0 &&
    shouldRetryWithContentFallback()
  ) {
    return map(await request(CONTENT_FALLBACK_LOCALE))
  }

  return mapped
}

async function withNotFoundFallback<T>(request: (apiLocale?: string) => Promise<T>): Promise<T> {
  try {
    return await request()
  } catch (error) {
    const apiError = isApiError(error) ? error : normalizeApiError(error)
    if (apiError.statusCode !== 404 || !shouldRetryWithContentFallback()) {
      throw error
    }
    return request(CONTENT_FALLBACK_LOCALE)
  }
}

export class MediaService {
  private readonly api: MediaApi

  constructor(api?: MediaApi) {
    if (api) {
      this.api = api
      return
    }

    const config = useRuntimeConfig()
    this.api = new MediaApi(config.public.webApiBaseUrl as string)
  }

  async listNews(params: MediaListQueryParams = {}): Promise<MediaListResult<MediaArticle>> {
    return withEmptyListFallback(
      (apiLocale) => this.api.listNews(params, apiLocale ? { apiLocale } : undefined),
      mapMediaArticlesResponse,
    )
  }

  async getNews(id: string): Promise<MediaArticle> {
    const response = await withNotFoundFallback((apiLocale) =>
      this.api.getNews(id, apiLocale ? { apiLocale } : undefined),
    )
    return mapMediaArticle(unwrapItem<MediaArticleApiDto>(response))
  }

  async listEvents(params: MediaListQueryParams = {}): Promise<MediaListResult<MediaArticle>> {
    return withEmptyListFallback(
      (apiLocale) => this.api.listEvents(params, apiLocale ? { apiLocale } : undefined),
      mapMediaArticlesResponse,
    )
  }

  async getEvent(id: string): Promise<MediaArticle> {
    const response = await withNotFoundFallback((apiLocale) =>
      this.api.getEvent(id, apiLocale ? { apiLocale } : undefined),
    )
    return mapMediaArticle(unwrapItem<MediaArticleApiDto>(response))
  }

  async listImageGalleries(
    params: MediaListQueryParams = {},
  ): Promise<MediaListResult<MediaGallery>> {
    return withEmptyListFallback(
      (apiLocale) => this.api.listImageGalleries(params, apiLocale ? { apiLocale } : undefined),
      mapMediaGalleriesResponse,
    )
  }

  async getImageGallery(id: string): Promise<MediaGallery> {
    const response = await withNotFoundFallback((apiLocale) =>
      this.api.getImageGallery(id, apiLocale ? { apiLocale } : undefined),
    )
    return mapMediaGallery(unwrapItem<MediaGalleryApiDto>(response))
  }

  async listVideoGalleries(
    params: MediaListQueryParams = {},
  ): Promise<MediaListResult<MediaGallery>> {
    return withEmptyListFallback(
      (apiLocale) => this.api.listVideoGalleries(params, apiLocale ? { apiLocale } : undefined),
      mapMediaGalleriesResponse,
    )
  }

  async getVideoGallery(id: string): Promise<MediaGallery> {
    const response = await withNotFoundFallback((apiLocale) =>
      this.api.getVideoGallery(id, apiLocale ? { apiLocale } : undefined),
    )
    return mapMediaGallery(unwrapItem<MediaGalleryApiDto>(response))
  }
}

let mediaService: MediaService | null = null

export function getMediaService(): MediaService {
  if (!mediaService) mediaService = new MediaService()
  return mediaService
}
