import type {
  CategoryStoresApiResponse,
  CategoryStoresMetaApiDto,
  StoreApiDto,
  StoreCategoryApiDto,
  StoreDetailApiDto,
  StoreProductApiDto,
  StoreProductCategoriesApiResponse,
  StoreProductCategoryApiDto,
  StoreProductsApiResponse,
  StoreSocialLinkApiDto,
} from '@modules/stores/types/api.types'
import type {
  CategoryStoresMeta,
  CategoryStoresResult,
  Store,
  StoreCategory,
  StoreProduct,
  StoreProductCategory,
  StoreProductsResult,
  StoreProfile,
  StoreSocialLink,
} from '@modules/stores/types/internal.types'

export function mapStoreCategory(dto: StoreCategoryApiDto): StoreCategory {
  return {
    id: dto.id,
    name: dto.name,
    content: dto.content,
    description: dto.description,
    slug: dto.slug,
    logo: dto.logo,
    cover: dto.cover,
    commissionPercentage: dto.commission_percentage,
  }
}

export function mapStoreCategories(dtos: StoreCategoryApiDto[]): StoreCategory[] {
  return dtos.map(mapStoreCategory)
}

function toCount(value: string | number | undefined): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

function toAbsoluteUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed.replace(/^\/+/, '')}`
}

function parseSocialLinks(raw: string | undefined): StoreSocialLink[] {
  if (!raw?.trim()) return []

  try {
    const parsed = JSON.parse(raw) as StoreSocialLinkApiDto[]
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => {
        const platform = String(item?.selectSocial || '').trim()
        const url = toAbsoluteUrl(String(item?.link || ''))
        if (!platform || !url) return null
        return { platform, url } satisfies StoreSocialLink
      })
      .filter((item): item is StoreSocialLink => item != null)
  } catch {
    return []
  }
}

export function mapStore(dto: StoreApiDto): Store {
  return {
    id: dto.id,
    name: dto.name.trim(),
    description: (dto.description || dto.about || '').trim(),
    slug: dto.url,
    logo: dto.logo || '',
    cover: dto.cover || '',
    productsCount: toCount(dto.items_count),
    cityName: dto.city?.name?.trim() || '',
    address: dto.address?.trim() || '',
  }
}

export function mapStores(dtos: StoreApiDto[]): Store[] {
  return dtos.map(mapStore)
}

export function mapStoreProfile(dto: StoreDetailApiDto): StoreProfile {
  return {
    id: dto.id,
    name: dto.name.trim(),
    description: (dto.description || dto.about || '').trim(),
    about: (dto.about || dto.description || '').trim(),
    policies: (dto.policies || '').trim(),
    address: dto.address?.trim() || '',
    slug: dto.url,
    logo: dto.logo || '',
    cover: dto.cover || '',
    productsCount: toCount(dto.items_count),
    viewsCount: toCount(dto.total_views),
    reviewsCount: toCount(dto.total_reviews),
    favoritesCount: toCount(dto.total_favourites),
    cityName: dto.city?.name?.trim() || '',
    countryName: dto.country?.name?.trim() || '',
    categoryName: dto.category?.name?.trim() || '',
    categorySlug: dto.category?.slug || '',
    socialLinks: parseSocialLinks(dto.social_media_links),
  }
}

export function mapCategoryStoresMeta(dto: CategoryStoresMetaApiDto): CategoryStoresMeta {
  return {
    totalItems: dto.totalItems,
    itemCount: dto.itemCount,
    itemsPerPage: dto.itemsPerPage,
    totalPages: dto.totalPages || 1,
    currentPage: dto.currentPage || 1,
  }
}

export function mapCategoryStoresResponse(
  response: CategoryStoresApiResponse,
): CategoryStoresResult {
  return {
    stores: mapStores(response.data ?? []),
    meta: mapCategoryStoresMeta(response.meta),
    categoryName: response.category,
  }
}

export function mapStoreProductCategory(
  dto: StoreProductCategoryApiDto,
): StoreProductCategory {
  return {
    id: dto.id,
    name: dto.name.trim(),
    description: (dto.description || '').trim(),
    image: dto.image || '',
    productsCount: toCount(dto.num_of_products),
  }
}

export function mapStoreProductCategories(
  dtos: StoreProductCategoryApiDto[],
): StoreProductCategory[] {
  return dtos.map(mapStoreProductCategory)
}

export function mapStoreProductCategoriesResponse(
  response: StoreProductCategoriesApiResponse,
): StoreProductCategory[] {
  return mapStoreProductCategories(response.data ?? [])
}

export function mapStoreProduct(dto: StoreProductApiDto): StoreProduct {
  const primaryCategory = dto.product_categories?.[0]
  const priceInfo = dto.price_info
  const price = toCount(dto.price)
  const finalPrice = priceInfo ? toCount(priceInfo.final_price) : price
  const discount = priceInfo ? toCount(priceInfo.discount) : 0

  return {
    id: dto.id,
    name: dto.name.trim(),
    description: (dto.description || dto.content || '').trim(),
    image: dto.featured_image || dto.product_images?.[0] || '',
    price,
    finalPrice,
    discount,
    rating: typeof dto.stars === 'number' && Number.isFinite(dto.stars) ? dto.stars : null,
    categoryId: primaryCategory?.id || '',
    categoryName: primaryCategory?.name?.trim() || '',
  }
}

export function mapStoreProducts(dtos: StoreProductApiDto[]): StoreProduct[] {
  return dtos.map(mapStoreProduct)
}

export function mapStoreProductsResponse(
  response: StoreProductsApiResponse,
): StoreProductsResult {
  return {
    products: mapStoreProducts(response.data ?? []),
    meta: mapCategoryStoresMeta(response.meta),
  }
}
