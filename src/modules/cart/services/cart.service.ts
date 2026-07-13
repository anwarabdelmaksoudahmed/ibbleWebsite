import { CartApi } from '@modules/cart/api/cart.api'
import type { Cart, CartItemInput } from '@modules/cart/types'
import { createEmptyCart, mapCartResponse } from '@modules/cart/utils/mappers'

export type CartMutationResult = {
  cart: Cart
  message?: string
  /** True when the API body included cart line data (not message-only). */
  hasPayload: boolean
}

function buildUpsertPayload(input: CartItemInput, quantity: number) {
  return {
    carts: [
      {
        store_info: { id: String(input.storeId) },
        store_products: [
          {
            id: String(input.productId),
            quantityInCart: quantity,
          },
        ],
      },
    ],
  }
}

function resolveMutationResult(
  response: { message?: string } | null | undefined,
): CartMutationResult {
  const cart = mapCartResponse(response)
  const hasPayload = cart.stores.length > 0 || Object.keys(cart.productQuantities).length > 0
  return {
    cart: hasPayload ? cart : createEmptyCart(),
    message: response?.message,
    hasPayload,
  }
}

export class CartService {
  private readonly api: CartApi

  constructor(api?: CartApi) {
    this.api = api ?? new CartApi()
  }

  async getCart(): Promise<Cart> {
    const response = await this.api.getCart()
    return mapCartResponse(response)
  }

  async addToCart(input: CartItemInput): Promise<CartMutationResult> {
    const quantity = Math.max(1, Math.floor(input.quantity ?? 1))
    const response = await this.api.upsertCart(buildUpsertPayload(input, quantity))
    return resolveMutationResult(response)
  }

  async updateQuantity(input: CartItemInput & { quantity: number }): Promise<CartMutationResult> {
    const quantity = Math.max(1, Math.floor(input.quantity))
    const response = await this.api.upsertCart(buildUpsertPayload(input, quantity))
    return resolveMutationResult(response)
  }

  async removeFromCart(input: CartItemInput): Promise<CartMutationResult> {
    const response = await this.api.removeProduct(String(input.productId))
    return {
      cart: createEmptyCart(),
      message: response.message,
      hasPayload: false,
    }
  }

  /** Re-add checkout items after a cancelled/failed payment when the backend cleared the cart. */
  async restoreStoreGroup(store: Cart['stores'][number]): Promise<void> {
    if (!store.storeId || store.products.length === 0) return

    await this.api.upsertCart({
      carts: [
        {
          store_info: { id: store.storeId },
          store_products: store.products.map((product) => ({
            id: product.id,
            quantityInCart: product.quantity,
          })),
        },
      ],
    })
  }
}

let cartService: CartService | null = null

export function getCartService(): CartService {
  if (!cartService) {
    cartService = new CartService()
  }
  return cartService
}
