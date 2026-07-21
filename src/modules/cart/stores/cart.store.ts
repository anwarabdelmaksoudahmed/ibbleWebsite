import { defineStore } from 'pinia'
import type { CartState } from '@modules/cart/types'

/**
 * Client UI state only. Server cart cache lives in Vue Query (`CART_QUERY_KEYS`).
 */
export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    isDrawerOpen: false,
  }),

  actions: {
    openDrawer() {
      this.isDrawerOpen = true
    },

    closeDrawer() {
      this.isDrawerOpen = false
    },

    toggleDrawer() {
      this.isDrawerOpen = !this.isDrawerOpen
    },
  },
})
