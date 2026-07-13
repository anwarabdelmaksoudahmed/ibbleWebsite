import type {
  CartApiResponse,
  CartLineItemApiDto,
  CartMutationApiResponse,
  CartPayloadListItem,
  CartStoreGroupApiDto,
  CartStoreProductApiDto,
} from '@modules/cart/types/api.types'
import type { Cart, CartProduct, CartStoreGroup } from '@modules/cart/types/internal.types'

function toQuantity(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function isFlatLineItem(item: CartPayloadListItem): item is CartLineItemApiDto {
  return isRecord(item) && 'product' in item && 'store' in item && !('store_info' in item)
}

function isGroupedStore(item: CartPayloadListItem): item is CartStoreGroupApiDto {
  return isRecord(item) && 'store_info' in item
}

function mapCartProduct(dto: CartStoreProductApiDto, lineId?: string): CartProduct {
  const price = dto.price == null ? null : Number(dto.price)
  const finalPrice = dto.final_price == null ? null : Number(dto.final_price)

  return {
    id: String(dto.id),
    lineId,
    quantity: toQuantity(dto.quantityInCart),
    name: (dto.name || '').trim(),
    image: dto.featured_image || '',
    price: price != null && Number.isFinite(price) ? price : null,
    finalPrice: finalPrice != null && Number.isFinite(finalPrice) ? finalPrice : null,
  }
}

function mapFlatLineToProduct(item: CartLineItemApiDto): CartProduct | null {
  const productId = String(item.product?.id || '')
  if (!productId) return null

  const unitPrice = item.product?.price == null ? null : Number(item.product.price)
  const rawFinal = item.product?.price_info?.final_price ?? item.product?.price
  const finalPrice = rawFinal == null ? null : Number(rawFinal)
  const quantity = toQuantity(item.qty ?? item.quantity)

  if (quantity <= 0) return null

  return {
    id: productId,
    lineId: item.id ? String(item.id) : undefined,
    quantity,
    name: (item.product?.name || '').trim(),
    image: item.product?.featured_image || '',
    price: unitPrice != null && Number.isFinite(unitPrice) ? unitPrice : null,
    finalPrice: finalPrice != null && Number.isFinite(finalPrice) ? finalPrice : null,
  }
}

function groupFlatLineItems(items: CartLineItemApiDto[]): CartStoreGroup[] {
  const groups = new Map<string, CartStoreGroup>()

  for (const item of items) {
    const storeId = String(item.store?.id || '')
    const product = mapFlatLineToProduct(item)
    if (!storeId || !product) continue

    let group = groups.get(storeId)
    if (!group) {
      group = {
        storeId,
        storeName: (item.store?.name || '').trim(),
        storeLogo: item.store?.logo || '',
        storeSlug: item.store?.url || '',
        products: [],
      }
      groups.set(storeId, group)
    }

    group.products.push(product)
  }

  return Array.from(groups.values())
}

function mapCartStoreGroup(dto: CartStoreGroupApiDto): CartStoreGroup {
  return {
    storeId: String(dto.store_info?.id || ''),
    storeName: (dto.store_info?.name || '').trim(),
    storeLogo: dto.store_info?.logo || '',
    storeSlug: dto.store_info?.url || '',
    products: (dto.store_products ?? []).map((p) => mapCartProduct(p)).filter((p) => p.id && p.quantity > 0),
  }
}

function normalizeToStoreGroups(items: CartPayloadListItem[]): CartStoreGroup[] {
  if (items.length === 0) return []

  if (items.every(isFlatLineItem)) {
    return groupFlatLineItems(items)
  }

  if (items.every(isGroupedStore)) {
    return items.map(mapCartStoreGroup)
  }

  const groups: CartStoreGroup[] = []
  const flat: CartLineItemApiDto[] = []

  for (const item of items) {
    if (isGroupedStore(item)) groups.push(mapCartStoreGroup(item))
    else if (isFlatLineItem(item)) flat.push(item)
  }

  return [...groups, ...groupFlatLineItems(flat)]
}

function extractCartItems(
  payload: CartApiResponse | CartMutationApiResponse | null | undefined,
): CartPayloadListItem[] {
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
  const stores = normalizeToStoreGroups(extractCartItems(payload)).filter(
    (group) => group.storeId && group.products.length > 0,
  )

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

/** Line subtotal for a cart product (final unit price × qty). */
export function getLineTotal(product: CartProduct): number {
  const unit = product.finalPrice ?? product.price ?? 0
  return unit * product.quantity
}

/** Store group subtotal. */
export function getStoreSubtotal(store: CartStoreGroup): number {
  return store.products.reduce((sum, product) => sum + getLineTotal(product), 0)
}

/** Grand total across all store groups. */
export function getCartTotal(cart: Cart): number {
  return cart.stores.reduce((sum, store) => sum + getStoreSubtotal(store), 0)
}
