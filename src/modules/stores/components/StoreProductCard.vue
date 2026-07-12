<script setup lang="ts">
import type { StoreProduct } from '@modules/stores/types'

const props = withDefaults(
  defineProps<{
    product: StoreProduct
    index?: number
    animate?: boolean
  }>(),
  {
    animate: false,
  },
)

const { t, n } = useI18n()

const hasDiscount = computed(() => props.product.finalPrice < props.product.price)

const formattedPrice = computed(() => n(props.product.finalPrice))

const formattedOriginal = computed(() => n(props.product.price))

const discountPercent = computed(() => {
  if (!hasDiscount.value || props.product.price <= 0) return 0
  const amount =
    props.product.discount > 0
      ? props.product.discount
      : props.product.price - props.product.finalPrice
  return Math.round((amount / props.product.price) * 100)
})

const animationStyle = computed(() =>
  props.animate && props.index != null
    ? { animationDelay: `${100 + props.index * 45}ms` }
    : undefined,
)

const ratingStars = computed(() => {
  if (props.product.rating == null || props.product.rating <= 0) return []
  const full = Math.round(Math.min(5, Math.max(0, props.product.rating)))
  return Array.from({ length: 5 }, (_, i) => i < full)
})
</script>

<template>
  <article
    class="store-product-card group flex h-full flex-col overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white shadow-[0_8px_28px_-18px_rgba(45,83,61,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-ibbil-gold/40 hover:shadow-[0_18px_40px_-20px_rgba(45,83,61,0.45)] dark:border-ibbil-green/20 dark:bg-surface-elevated"
    :class="animate ? 'store-product-card-enter' : undefined"
    :style="animationStyle"
  >
    <div class="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-ibbil-green/[0.08] to-ibbil-green/[0.02]">
      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.name"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        loading="lazy"
      >
      <div
        v-else
        class="flex h-full items-center justify-center"
        aria-hidden="true"
      >
        <Icon name="lucide:package" class="h-12 w-12 text-ibbil-green/25" />
      </div>

      <span
        v-if="hasDiscount && discountPercent > 0"
        class="absolute start-3 top-3 rounded-lg bg-ibbil-gold px-2 py-1 text-xs font-bold text-ibbil-green-dark shadow-sm"
      >
        -{{ discountPercent }}%
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
      <p
        v-if="product.categoryName"
        class="text-xs font-semibold tracking-wide text-ibbil-gold"
      >
        {{ product.categoryName }}
      </p>

      <h3 class="text-base font-bold leading-snug text-ibbil-green sm:text-lg">
        {{ product.name }}
      </h3>

      <p
        v-if="product.description"
        class="line-clamp-2 text-sm leading-relaxed text-foreground-muted"
      >
        {{ product.description }}
      </p>

      <div
        v-if="ratingStars.length"
        class="flex items-center gap-0.5"
        :aria-label="t('site.stores.profile.rating', { rating: product.rating })"
      >
        <Icon
          v-for="(filled, i) in ratingStars"
          :key="i"
          name="lucide:star"
          class="h-3.5 w-3.5"
          :class="filled ? 'fill-ibbil-gold text-ibbil-gold' : 'text-ibbil-green/20'"
          aria-hidden="true"
        />
      </div>

      <div class="mt-auto flex items-baseline gap-2 pt-1">
        <span class="text-lg font-extrabold text-ibbil-green">
          {{ formattedPrice }}
          <span class="text-sm font-semibold">{{ t('site.stores.profile.currency') }}</span>
        </span>
        <span
          v-if="hasDiscount"
          class="text-sm text-foreground-muted line-through"
        >
          {{ formattedOriginal }}
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.store-product-card-enter {
  animation: store-product-fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes store-product-fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .store-product-card-enter {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
