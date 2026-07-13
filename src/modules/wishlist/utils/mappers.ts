import type {
  WishlistApiResponse,
  WishlistItemApiDto,
  WishlistMutationApiResponse,
} from '@modules/wishlist/types/api.types'
import type { Wishlist, WishlistItem } from '@modules/wishlist/types/internal.types'

function resolveProductId(dto: WishlistItemApiDto): string {
  return String(dto.product_id || dto.productId || dto.product?.id || dto.id || '')
}

function mapWishlistItem(dto: WishlistItemApiDto): WishlistItem | null {
  const productId = resolveProductId(dto)
  if (!productId) return null

  return {
    id: String(dto.id || productId),
    productId,
    name: (dto.product?.name || '').trim(),
    image: dto.product?.featured_image || '',
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
  if (data && typeof data === 'object' && !Array.isArray(data) && ('product_id' in data || 'id' in data)) {
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

export function withWishlistProduct(wishlist: Wishlist, productId: string): Wishlist {
  const next = cloneWishlist(wishlist)
  if (next.productIds.has(productId)) return next

  next.productIds.add(productId)
  next.items = [...next.items, { id: productId, productId, name: '', image: '' }]
  return next
}

export function withoutWishlistProduct(wishlist: Wishlist, productId: string): Wishlist {
  const next = cloneWishlist(wishlist)
  next.productIds.delete(productId)
  next.items = next.items.filter((item) => item.productId !== productId)
  return next
}
