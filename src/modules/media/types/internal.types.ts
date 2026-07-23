export type MediaPaginationMeta = {
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}

export type MediaCategory = {
  id: string
  title: string
  slug: string
}

export type MediaArticle = {
  id: string
  title: string
  content: string
  excerpt: string
  color: string
  featuredImage: string
  type: 'news' | 'events' | string
  slug: string
  viewsCount: number
  publishDate: string
  createdAt: string
  category: MediaCategory | null
}

export type MediaAssetKind = 'image' | 'video' | 'unknown'

export type MediaAsset = {
  id: string
  title: string
  url: string
  kind: MediaAssetKind
}

export type MediaGallery = {
  id: string
  title: string
  content: string
  featuredImage: string
  contains: 'image' | 'video' | string
  viewsCount: number
  mediaCount: number
  publishDate: string
  createdAt: string
  media: MediaAsset[]
}

export type MediaListResult<T> = {
  items: T[]
  meta: MediaPaginationMeta
}
