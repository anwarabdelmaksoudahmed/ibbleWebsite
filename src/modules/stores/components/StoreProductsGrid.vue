<script setup lang="ts">
import StoreProductCard from '@modules/stores/components/StoreProductCard.vue'
import type { StoreProduct } from '@modules/stores/types'

defineProps<{
  products: StoreProduct[]
  storeId?: string
  loading?: boolean
  animate?: boolean
}>()
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
        :index="index"
        :animate="animate"
      />
    </li>
  </ul>
</template>
