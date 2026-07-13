import type {
  CartApiResponse,
  CartMutationApiResponse,
  CartStoreGroupApiDto,
  CartStoreProductApiDto,
} from '@modules/cart/types/api.types'
import type { Cart, CartProduct, CartStoreGroup } from '@modules/cart/types/internal.types'

function toQuantity(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

function mapCartProduct(dto: CartStoreProductApiDto): CartProduct {
  const price = dto.price == null ? null : Number(dto.price)
  const finalPrice = dto.final_price == null ? null : Number(dto.final_price)

  return {
    id: String(dto.id),
    quantity: toQuantity(dto.quantityInCart),
    name: (dto.name || '').trim(),
    image: dto.featured_image || '',
    price: price != null && Number.isFinite(price) ? price : null,
    finalPrice: finalPrice != null && Number.isFinite(finalPrice) ? finalPrice : null,
  }
}

function mapCartStoreGroup(dto: CartStoreGroupApiDto): CartStoreGroup {
  return {
    storeId: String(dto.store_info?.id || ''),
    storeName: (dto.store_info?.name || '').trim(),
    storeLogo: dto.store_info?.logo || '',
    storeSlug: dto.store_info?.url || '',
    products: (dto.store_products ?? []).map(mapCartProduct).filter((p) => p.id && p.quantity > 0),
  }
}

function extractCartGroups(
  payload: CartApiResponse | CartMutationApiResponse | null | undefined,
): CartStoreGroupApiDto[] {
  if (!payload) return []
  if (Array.isArray(payload)) return payload

  if (Array.isArray(payload.carts)) return payload.carts

  const data = payload.data
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && Array.isArray(data.carts)) return data.carts

  return []
}

export function mapCartResponse(
  payload: CartApiResponse | CartMutationApiResponse | null | undefined,
): Cart {
  const stores = extractCartGroups(payload)
    .map(mapCartStoreGroup)
    .filter((group) => group.storeId && group.products.length > 0)

  const productQuantities: Record<string, number> = {}
  for (const store of stores) {
    for (const product of store.products) {
      productQuantities[product.id] = (productQuantities[product.id] ?? 0) + product.quantity
    }
  }

  return { stores, productQuantities }
}

export function createEmptyCart(): Cart {
  return { stores: [], productQuantities: {} }
}
