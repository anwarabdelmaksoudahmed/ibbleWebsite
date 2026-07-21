<script setup lang="ts">
import StoreProductCard from '@modules/stores/components/StoreProductCard.vue'
import type { StoreProduct } from '@modules/stores/types'
import { STORES_ROUTES } from '@modules/stores/constants/routes'

const props = defineProps<{
  products: StoreProduct[]
  storeId?: string
  categorySlug?: string
  storeSlug?: string
  loading?: boolean
  animate?: boolean
}>()

const localePath = useLocalePath()

function productTo(product: StoreProduct) {
  if (!props.categorySlug || !props.storeSlug) return undefined
  return localePath(
    STORES_ROUTES.PRODUCT(props.categorySlug, props.storeSlug, product.id),
  )
}
</script>

<template>
  <ul
    role="list"
    class="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
    :aria-busy="loading || undefined"
  >
    <li v-for="(product, index) in products" :key="product.id">
      <StoreProductCard
        :product="product"
        :store-id="storeId"
        :to="productTo(product)"
        :index="index"
        :animate="animate"
      />
    </li>
  </ul>
</template>
