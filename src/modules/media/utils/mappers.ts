import type {
  MediaArticleApiDto,
  MediaAssetApiDto,
  MediaCategoryApiDto,
  MediaGalleryApiDto,
  MediaPaginatedApiResponse,
  MediaPaginationMetaApiDto,
} from '@modules/media/types/api.types'
import type {
  MediaArticle,
  MediaAsset,
  MediaAssetKind,
  MediaCategory,
  MediaGallery,
  MediaListResult,
  MediaPaginationMeta,
} from '@modules/media/types/internal.types'

function toCount(value: string | number | null | undefined): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

function toText(value: string | null | undefined): string {
  return (value ?? '').trim()
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url)
}

function detectAssetKind(raw: MediaAssetApiDto, url: string): MediaAssetKind {
  const hint = `${raw.type || ''} ${raw.contains || ''} ${raw.mime_type || ''}`.toLowerCase()
  if (hint.includes('video') || isVideoUrl(url)) return 'video'
  if (hint.includes('image') || url) return 'image'
  return url ? 'image' : 'unknown'
}

function pickAssetUrl(raw: MediaAssetApiDto): string {
  return toText(
    raw.url || raw.path || raw.file || raw.media || raw.src || raw.featured_image || undefined,
  )
}

export function mapPaginationMeta(
  meta?: MediaPaginationMetaApiDto | null,
): MediaPaginationMeta {
  return {
    totalItems: toCount(meta?.totalItems),
    itemCount: toCount(meta?.itemCount),
    itemsPerPage: toCount(meta?.itemsPerPage) || 10,
    totalPages: Math.max(1, toCount(meta?.totalPages) || 1),
    currentPage: Math.max(1, toCount(meta?.currentPage) || 1),
  }
}

function mapCategory(dto?: MediaCategoryApiDto | null): MediaCategory | null {
  if (!dto?.id) return null
  return {
    id: String(dto.id),
    title: toText(dto.title),
    slug: toText(dto.slug),
  }
}

export function mapMediaAsset(dto: MediaAssetApiDto, index = 0): MediaAsset | null {
  const url = pickAssetUrl(dto)
  if (!url) return null

  return {
    id: String(dto.id ?? `asset-${index}`),
    title: toText(dto.title),
    url,
    kind: detectAssetKind(dto, url),
  }
}

function collectGalleryAssets(dto: MediaGalleryApiDto): MediaAsset[] {
  const pools = [dto.media, dto.gallery_media, dto.files, dto.images, dto.videos]
  const seen = new Set<string>()
  const assets: MediaAsset[] = []

  for (const pool of pools) {
    if (!Array.isArray(pool)) continue
    pool.forEach((item, index) => {
      const mapped = mapMediaAsset(item, index)
      if (!mapped || seen.has(mapped.url)) return
      seen.add(mapped.url)
      assets.push(mapped)
    })
  }

  const featured = toText(dto.featured_image)
  if (featured && !seen.has(featured)) {
    assets.unshift({
      id: `featured-${dto.id}`,
      title: toText(dto.title),
      url: featured,
      kind: dto.contains === 'video' || isVideoUrl(featured) ? 'video' : 'image',
    })
  }

  return assets
}

export function mapMediaArticle(dto: MediaArticleApiDto): MediaArticle {
  return {
    id: String(dto.id),
    title: toText(dto.title),
    content: toText(dto.content),
    excerpt: toText(dto.excerpt || dto.content),
    color: toText(dto.color) || '#2d533d',
    featuredImage: toText(dto.featured_image),
    type: toText(dto.type) || 'news',
    slug: toText(dto.slug) || String(dto.id),
    viewsCount: toCount(dto.views_count),
    publishDate: toText(dto.publish_date),
    createdAt: toText(dto.created_at),
    category: mapCategory(dto.category),
  }
}

export function mapMediaGallery(dto: MediaGalleryApiDto): MediaGallery {
  const media = collectGalleryAssets(dto)
  const featuredImage = toText(dto.featured_image) || media[0]?.url || ''

  return {
    id: String(dto.id),
    title: toText(dto.title),
    content: toText(dto.content),
    featuredImage,
    contains: toText(dto.contains) || 'image',
    viewsCount: toCount(dto.views_count),
    mediaCount: toCount(dto.media_count) || media.length,
    publishDate: toText(dto.publish_date),
    createdAt: toText(dto.created_at),
    media,
  }
}

export function mapMediaArticlesResponse(
  response: MediaPaginatedApiResponse<MediaArticleApiDto>,
): MediaListResult<MediaArticle> {
  return {
    items: (response.data ?? []).map(mapMediaArticle),
    meta: mapPaginationMeta(response.meta),
  }
}

export function mapMediaGalleriesResponse(
  response: MediaPaginatedApiResponse<MediaGalleryApiDto>,
): MediaListResult<MediaGallery> {
  return {
    items: (response.data ?? []).map(mapMediaGallery),
    meta: mapPaginationMeta(response.meta),
  }
}
