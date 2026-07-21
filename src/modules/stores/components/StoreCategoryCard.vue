<script setup lang="ts">
import { marketplaceCategoryImageForSlug } from '@shared/constants/home-marketplace'
import type { MarketplaceCardVariant } from '@shared/types/marketplace-card'
import type { StoreCategory } from '@modules/stores/types'
import { STORES_ROUTES } from '@modules/stores/constants/routes'

const props = withDefaults(
  defineProps<{
    category: StoreCategory
    variant?: MarketplaceCardVariant
    index?: number
    animate?: boolean
  }>(),
  {
    variant: 'grid',
    index: undefined,
    animate: false,
  },
)

const { t } = useI18n()

const to = computed(() => STORES_ROUTES.CATEGORY(props.category.slug))
const isList = computed(() => props.variant === 'list')

const illustration = computed(
  () =>
    marketplaceCategoryImageForSlug(props.category.slug) ||
    props.category.logo ||
    props.category.cover ||
    '',
)

const hasIllustration = computed(() => Boolean(illustration.value?.trim()))
const description = computed(
  () => (props.category.description || props.category.content || '').trim(),
)

const animationStyle = computed(() =>
  props.animate && props.index != null
    ? { animationDelay: `${100 + props.index * 55}ms` }
    : undefined,
)

const mediaAnimationStyle = computed(() =>
  props.animate && props.index != null
    ? { animationDelay: `${170 + props.index * 55}ms` }
    : undefined,
)
</script>

<template>
  <NuxtLinkLocale
    :to="to"
    class="category-card group relative flex h-full overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green focus-visible:ring-offset-2"
    :class="[
      animate ? 'category-card-enter' : undefined,
      isList
        ? 'items-center gap-4 p-4 shadow-[0_10px_30px_-18px_rgba(45,83,61,0.35)] hover:-translate-y-0.5 hover:border-ibbil-gold/50 hover:shadow-[0_22px_44px_-22px_rgba(45,83,61,0.45)] sm:gap-6 sm:p-5'
        : 'flex-col text-center shadow-[0_8px_28px_-18px_rgba(45,83,61,0.3)] hover:-translate-y-1.5 hover:border-ibbil-gold/50 hover:shadow-[0_20px_44px_-20px_rgba(45,83,61,0.45)]',
    ]"
    :style="animationStyle"
  >
    <!-- Brand gold accent (top edge) -->
    <span
      class="pointer-events-none absolute inset-x-0 top-0 z-[2] h-1 origin-center scale-x-0 rounded-b-full bg-ibbil-gold transition-transform duration-300 group-hover:scale-x-100"
      aria-hidden="true"
    />

    <!-- Subtle wash on hover -->
    <span
      class="pointer-events-none absolute inset-0 bg-gradient-to-b from-ibbil-green/[0.045] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      aria-hidden="true"
    />

    <!-- Media: illustration clipped inside a circular disc over a soft halo -->
    <div
      class="relative flex shrink-0 items-center justify-center"
      :class="[
        isList
          ? 'aspect-square w-20 sm:w-28'
          : 'mx-auto mt-6 aspect-square w-[56%] min-w-[6.5rem] max-w-[9.5rem] sm:mt-7 sm:max-w-[10.5rem]',
        animate ? 'category-card-media' : undefined,
      ]"
      :style="mediaAnimationStyle"
    >
      <span
        class="absolute -inset-2 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(45,83,61,0.1),rgba(45,83,61,0.04)_60%,transparent_78%)] transition-transform duration-500 group-hover:scale-105 sm:-inset-3"
        aria-hidden="true"
      />


      <span
        class="relative z-[1] block h-full w-full overflow-hidden rounded-full bg-white shadow-[0_10px_24px_-12px_rgba(45,83,61,0.35)] ring-1 ring-ibbil-green/10 transition-all duration-500 group-hover:shadow-[0_16px_32px_-14px_rgba(45,83,61,0.45)] group-hover:ring-ibbil-gold/50"
      >
        <img
          v-if="hasIllustration"
          :src="illustration"
          alt=""
          class="h-full w-full scale-[1.04] object-cover transition-transform duration-500 group-hover:scale-[1.12]"
          width="392"
          height="392"
          loading="lazy"
          decoding="async"
        >
        <span
          v-else
          class="flex h-full w-full items-center justify-center bg-gradient-to-br from-ibbil-green/[0.08] to-ibbil-gold/[0.06]"
          aria-hidden="true"
        >
          <Icon
            name="lucide:store"
            class="size-8 text-ibbil-green/40 transition-colors duration-300 group-hover:text-ibbil-green/70 sm:size-10"
          />
        </span>
      </span>
    </div>

    <!-- List: content -->
    <div v-if="isList" class="flex min-w-0 flex-1 flex-col gap-1.5 py-1 text-start">
      <h3
        class="text-base font-extrabold tracking-tight text-ibbil-green transition-colors duration-300 group-hover:text-ibbil-green-dark sm:text-lg"
      >
        {{ category.name }}
      </h3>
      <p v-if="description" class="line-clamp-2 text-sm leading-relaxed text-foreground-muted">
        {{ description }}
      </p>
      <span
        class="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-ibbil-green transition-colors duration-300 group-hover:text-ibbil-gold"
      >
        {{ t('site.stores.exploreCategory') }}
        <DirectionalArrow variant="chevron" size="sm" animated />
      </span>
    </div>

    <!-- List: trailing affordance -->
    <span
      v-if="isList"
      class="hidden size-10 shrink-0 items-center justify-center rounded-full border border-ibbil-green/12 bg-ibbil-green/[0.04] text-ibbil-green transition-all duration-300 group-hover:border-ibbil-green group-hover:bg-ibbil-green group-hover:text-white sm:inline-flex"
      aria-hidden="true"
    >
      <DirectionalArrow variant="chevron" size="sm" animated />
    </span>

    <!-- Grid: content -->
    <div
      v-else
      class="flex w-full flex-1 flex-col items-center px-3.5 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-5"
    >
      <h3
        class="text-sm font-extrabold leading-snug tracking-tight text-ibbil-green transition-colors duration-300 group-hover:text-ibbil-green-dark sm:text-lg"
      >
        {{ category.name }}
      </h3>

      <p
        v-if="description"
        class="mt-1.5 hidden text-sm leading-relaxed text-foreground-muted sm:line-clamp-2"
      >
        {{ description }}
      </p>

      <div class="mt-auto pt-4 sm:pt-5">
        <span
          class="inline-flex items-center gap-1.5 rounded-full border border-ibbil-green/15 bg-ibbil-green/[0.05] px-3 py-1.5 text-xs font-bold text-ibbil-green transition-all duration-300 group-hover:border-ibbil-green group-hover:bg-ibbil-green group-hover:text-white sm:px-4 sm:py-2 sm:text-sm"
        >
          {{ t('site.stores.exploreCategory') }}
          <DirectionalArrow variant="chevron" size="sm" animated />
        </span>
      </div>
    </div>
  </NuxtLinkLocale>
</template>

<style scoped>
.category-card-enter {
  animation: category-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.category-card-media {
  animation: category-media-in 0.55s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}

@keyframes category-fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes category-media-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .category-card-enter,
  .category-card-media {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .category-card,
  .category-card * {
    transition: none !important;
  }
}
</style>
