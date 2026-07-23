export type MediaPaginationMetaApiDto = {
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}

export type MediaListQueryParams = {
  page?: number
  limit?: number
}

export type MediaCategoryApiDto = {
  id: string
  title: string
  parent_id?: string | null
  slug?: string
  created_at?: string
}

export type MediaArticleApiDto = {
  id: string
  title: string
  content: string
  excerpt?: string | null
  color?: string | null
  featured_image?: string | null
  type?: string
  status?: string
  category_id?: string | null
  slug?: string | null
  views_count?: string | number
  publish_date?: string | null
  created_at?: string
  category?: MediaCategoryApiDto | null
}

export type MediaGalleryApiDto = {
  id: string
  title: string
  content?: string | null
  featured_image?: string | null
  contains?: 'image' | 'video' | string
  status?: string
  created_at?: string
  publish_date?: string | null
  views_count?: string | number
  media_count?: string | number
  media?: MediaAssetApiDto[] | null
  gallery_media?: MediaAssetApiDto[] | null
  files?: MediaAssetApiDto[] | null
  images?: MediaAssetApiDto[] | null
  videos?: MediaAssetApiDto[] | null
}

export type MediaAssetApiDto = {
  id?: string | number
  title?: string | null
  url?: string | null
  path?: string | null
  file?: string | null
  media?: string | null
  src?: string | null
  type?: string | null
  contains?: string | null
  mime_type?: string | null
  featured_image?: string | null
}

export type MediaPaginatedApiResponse<T> = {
  data: T[]
  meta: MediaPaginationMetaApiDto
}

export type MediaItemApiResponse<T> = {
  data: T
}
