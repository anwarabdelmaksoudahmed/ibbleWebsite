import { MediaApi } from '@modules/media/api/media.api'
import type { MediaListQueryParams } from '@modules/media/types/api.types'
import type { MediaArticle, MediaGallery, MediaListResult } from '@modules/media/types'
import {
  mapMediaArticle,
  mapMediaArticlesResponse,
  mapMediaGalleriesResponse,
  mapMediaGallery,
} from '@modules/media/utils/mappers'
import type { MediaArticleApiDto, MediaGalleryApiDto, MediaItemApiResponse } from '@modules/media/types/api.types'

function unwrapItem<T>(response: MediaItemApiResponse<T> | T): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as MediaItemApiResponse<T>).data
  }
  return response as T
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

  listNews(params: MediaListQueryParams = {}): Promise<MediaListResult<MediaArticle>> {
    return this.api.listNews(params).then(mapMediaArticlesResponse)
  }

  async getNews(id: string): Promise<MediaArticle> {
    const response = await this.api.getNews(id)
    return mapMediaArticle(unwrapItem<MediaArticleApiDto>(response))
  }

  listEvents(params: MediaListQueryParams = {}): Promise<MediaListResult<MediaArticle>> {
    return this.api.listEvents(params).then(mapMediaArticlesResponse)
  }

  async getEvent(id: string): Promise<MediaArticle> {
    const response = await this.api.getEvent(id)
    return mapMediaArticle(unwrapItem<MediaArticleApiDto>(response))
  }

  listImageGalleries(params: MediaListQueryParams = {}): Promise<MediaListResult<MediaGallery>> {
    return this.api.listImageGalleries(params).then(mapMediaGalleriesResponse)
  }

  async getImageGallery(id: string): Promise<MediaGallery> {
    const response = await this.api.getImageGallery(id)
    return mapMediaGallery(unwrapItem<MediaGalleryApiDto>(response))
  }

  listVideoGalleries(params: MediaListQueryParams = {}): Promise<MediaListResult<MediaGallery>> {
    return this.api.listVideoGalleries(params).then(mapMediaGalleriesResponse)
  }

  async getVideoGallery(id: string): Promise<MediaGallery> {
    const response = await this.api.getVideoGallery(id)
    return mapMediaGallery(unwrapItem<MediaGalleryApiDto>(response))
  }
}

let mediaService: MediaService | null = null

export function getMediaService(): MediaService {
  if (!mediaService) mediaService = new MediaService()
  return mediaService
}
