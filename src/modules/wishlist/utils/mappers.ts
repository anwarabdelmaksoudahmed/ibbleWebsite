import type { StoreProductApiDto } from '@modules/stores/types'
import { mapStoreProduct } from '@modules/stores/utils/mappers'
import type {
  WishlistApiResponse,
  WishlistItemApiDto,
  WishlistMutationApiResponse,
} from '@modules/wishlist/types/api.types'
import type { Wishlist, WishlistItem } from '@modules/wishlist/types/internal.types'

function resolveProductId(dto: WishlistItemApiDto): string {
  return String(dto.product_id || dto.productId || dto.product?.id || dto.id || '')
}

function emptyStoreProduct(productId: string) {
  return {
    id: productId,
    storeId: '',
    name: '',
    description: '',
    image: '',
    price: 0,
    finalPrice: 0,
    discount: 0,
    rating: null as number | null,
    categoryId: '',
    categoryName: '',
  }
}

function toStoreProductDto(dto: WishlistItemApiDto, productId: string): StoreProductApiDto {
  return {
    id: productId,
    name: dto.name || dto.product?.name || '',
    content: dto.content || '',
    description: dto.description || '',
    featured_image: dto.featured_image || dto.product?.featured_image || '',
    status: dto.status || '',
    store_id: String(dto.store_id || ''),
    created_at: dto.created_at || '',
    quantity: dto.quantity ?? 0,
    price: dto.price ?? 0,
    sku: dto.sku || '',
    product_images: dto.product_images ?? [],
    product_categories: dto.product_categories ?? [],
    discounts: dto.discounts ?? [],
    price_info: dto.price_info ?? null,
    stars: dto.stars ?? null,
  }
}

function mapWishlistItem(dto: WishlistItemApiDto): WishlistItem | null {
  const productId = resolveProductId(dto)
  if (!productId) return null

  const product = mapStoreProduct(toStoreProductDto(dto, productId))
  const storeCategoryName = dto.store?.category?.name?.trim() || ''

  if (!product.categoryName && storeCategoryName) {
    product.categoryName = storeCategoryName
  }

  return {
    id: String(dto.id || productId),
    productId,
    name: product.name,
    image: product.image,
    product,
    storeName: dto.store?.name?.trim() || '',
    storeSlug: dto.store?.url?.trim() || '',
    categorySlug: dto.store?.category?.slug?.trim() || '',
  }
}

function extractItems(
  payload: WishlistApiResponse | WishlistMutationApiResponse | null | undefined,
): WishlistItemApiDto[] {
  if (!payload) return []
  if (Array.isArray(payload)) return payload

  if ('items' in payload && Array.isArray(payload.items)) return payload.items

  const data = 'data' in payload ? payload.data : undefined
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && !Array.isArray(data) && 'items' in data) {
    const nested = (data as { items?: WishlistItemApiDto[] }).items
    if (Array.isArray(nested)) return nested
  }
  if (
    data &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    ('product_id' in data || 'id' in data)
  ) {
    return [data as WishlistItemApiDto]
  }

  return []
}

export function mapWishlistResponse(
  payload: WishlistApiResponse | WishlistMutationApiResponse | null | undefined,
): Wishlist {
  const items = extractItems(payload)
    .map(mapWishlistItem)
    .filter((item): item is WishlistItem => item != null)

  return {
    items,
    productIds: new Set(items.map((item) => item.productId)),
  }
}

export function createEmptyWishlist(): Wishlist {
  return { items: [], productIds: new Set() }
}

export function cloneWishlist(wishlist: Wishlist): Wishlist {
  return {
    items: [...wishlist.items],
    productIds: new Set(wishlist.productIds),
  }
}

export function createPlaceholderWishlistItem(productId: string): WishlistItem {
  const product = emptyStoreProduct(productId)
  return {
    id: productId,
    productId,
    name: '',
    image: '',
    product,
    storeName: '',
    storeSlug: '',
    categorySlug: '',
  }
}

export function withWishlistProduct(wishlist: Wishlist, productId: string): Wishlist {
  const next = cloneWishlist(wishlist)
  if (next.productIds.has(productId)) return next

  next.productIds.add(productId)
  next.items = [...next.items, createPlaceholderWishlistItem(productId)]
  return next
}

export function withoutWishlistProduct(wishlist: Wishlist, productId: string): Wishlist {
  const next = cloneWishlist(wishlist)
  next.productIds.delete(productId)
  next.items = next.items.filter((item) => item.productId !== productId)
  return next
}
