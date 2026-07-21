import { defineStore } from 'pinia'
import type { WishlistState } from '@modules/wishlist/types'

/**
 * Client UI state only. Server wishlist cache lives in Vue Query (`WISHLIST_QUERY_KEYS`).
 */
export const useWishlistStore = defineStore('wishlist', {
  state: (): WishlistState => ({
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
