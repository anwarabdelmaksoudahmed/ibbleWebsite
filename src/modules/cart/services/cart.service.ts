import { CartApi } from '@modules/cart/api/cart.api'
import type { Cart, CartItemInput } from '@modules/cart/types'
import { createEmptyCart, mapCartResponse } from '@modules/cart/utils/mappers'

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

export class CartService {
  private readonly api: CartApi

  constructor(api?: CartApi) {
    this.api = api ?? new CartApi()
  }

  async getCart(): Promise<Cart> {
    const response = await this.api.getCart()
    return mapCartResponse(response)
  }

  async addToCart(input: CartItemInput): Promise<Cart> {
    const quantity = Math.max(1, Math.floor(input.quantity ?? 1))
    const response = await this.api.upsertCart(buildUpsertPayload(input, quantity))
    const mapped = mapCartResponse(response)
    // Some backends return only a message — caller should invalidate & refetch.
    return mapped.stores.length > 0 ? mapped : createEmptyCart()
  }

  /** Future-ready: set absolute quantity for a line. */
  async updateQuantity(input: CartItemInput & { quantity: number }): Promise<Cart> {
    const quantity = Math.max(0, Math.floor(input.quantity))
    const response = await this.api.upsertCart(buildUpsertPayload(input, quantity))
    return mapCartResponse(response)
  }

  async increaseQuantity(input: CartItemInput, currentQuantity: number): Promise<Cart> {
    return this.updateQuantity({
      ...input,
      quantity: Math.max(1, currentQuantity) + 1,
    })
  }

  async decreaseQuantity(input: CartItemInput, currentQuantity: number): Promise<Cart> {
    const next = Math.max(0, currentQuantity - 1)
    return this.updateQuantity({ ...input, quantity: next })
  }

  async removeFromCart(input: CartItemInput): Promise<Cart> {
    return this.updateQuantity({ ...input, quantity: 0 })
  }
}

let cartService: CartService | null = null

export function getCartService(): CartService {
  if (!cartService) {
    cartService = new CartService()
  }
  return cartService
}
