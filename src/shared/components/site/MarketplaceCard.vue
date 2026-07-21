<script setup lang="ts">
import type {
  MarketplaceCardMetaItem,
  MarketplaceCardVariant,
} from '@shared/types/marketplace-card'

const props = withDefaults(
  defineProps<{
    to: string
    title: string
    description?: string
    logo?: string
    cover?: string
    illustration?: string
    variant?: MarketplaceCardVariant
    meta?: MarketplaceCardMetaItem[]
    ctaLabel?: string
    /** Grid footer stat (e.g. "25 products"). Falls back to `ctaLabel`. */
    footerLabel?: string
    index?: number
    animate?: boolean
  }>(),
  {
    description: '',
    logo: '',
    cover: '',
    illustration: '',
    variant: 'grid',
    meta: () => [],
    ctaLabel: '',
    footerLabel: '',
    animate: false,
  },
)

const hasLogo = computed(() => Boolean(props.logo?.trim()))
const hasCover = computed(() => Boolean(props.cover?.trim()))
const hasIllustration = computed(() => Boolean(props.illustration?.trim()))
const hasDescription = computed(() => Boolean(props.description?.trim()))
const hasMeta = computed(() => props.meta.length > 0)
const isList = computed(() => props.variant === 'list')

const gridFooterLabel = computed(() => props.footerLabel || props.ctaLabel)

const animationStyle = computed(() =>
  props.animate && props.index != null
    ? { animationDelay: `${120 + props.index * 55}ms` }
    : undefined,
)

const mediaAnimationStyle = computed(() =>
  props.animate && props.index != null
    ? { animationDelay: `${180 + props.index * 55}ms` }
    : undefined,
)
</script>

<template>
  <NuxtLinkLocale
    :to="to"
    class="marketplace-card group relative flex overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green focus-visible:ring-offset-2"
    :class="[
      animate ? 'marketplace-card-enter' : undefined,
      isList
        ? 'flex-col shadow-[0_10px_30px_-18px_rgba(45,83,61,0.35)] hover:-translate-y-0.5 hover:border-ibbil-gold/40 hover:shadow-[0_22px_44px_-22px_rgba(45,83,61,0.45)] sm:flex-row sm:items-stretch'
        : 'h-full flex-col text-center shadow-[0_8px_28px_-18px_rgba(45,83,61,0.3)] hover:-translate-y-1.5 hover:border-ibbil-gold/50 hover:shadow-[0_18px_40px_-20px_rgba(45,83,61,0.45)]',
    ]"
    :style="animationStyle"
  >
    <span
      class="pointer-events-none absolute inset-x-0 top-0 z-[2] h-1 origin-center scale-x-0 rounded-b-full bg-ibbil-gold transition-transform duration-300 group-hover:scale-x-100"
      aria-hidden="true"
    />

    <!-- List: media -->
    <div
      v-if="isList"
      class="relative w-full shrink-0 overflow-hidden sm:w-[38%] sm:min-w-[12rem] sm:max-w-[18rem]"
      :class="
        hasIllustration
          ? 'aspect-[391/282] bg-[#fafbfa] sm:aspect-auto sm:min-h-[9rem]'
          : 'aspect-[16/10] bg-gradient-to-br from-ibbil-green/[0.08] to-ibbil-green/[0.02] sm:aspect-auto'
      "
    >
      <img
        v-if="hasIllustration"
        :src="illustration"
        alt=""
        class="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
        width="392"
        height="282"
        loading="lazy"
        decoding="async"
      >
      <img
        v-else-if="hasCover"
        :src="cover"
        alt=""
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        loading="lazy"
      >
      <div
        v-else
        class="flex h-full min-h-[9rem] items-center justify-center sm:min-h-full"
        aria-hidden="true"
      >
        <Icon name="lucide:store" class="h-12 w-12 text-ibbil-green/25" />
      </div>

      <div
        v-if="!hasIllustration"
        class="absolute bottom-3 start-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-white shadow-md sm:h-16 sm:w-16"
      >
        <img
          v-if="hasLogo"
          :src="logo"
          alt=""
          class="h-[78%] w-[78%] object-contain"
          loading="lazy"
        >
        <Icon
          v-else
          name="lucide:store"
          class="h-6 w-6 text-ibbil-green/60"
          aria-hidden="true"
        />
      </div>
    </div>

    <!-- List: content -->
    <div
      v-if="isList"
      class="flex min-w-0 flex-1 flex-col justify-center gap-3 p-5 sm:p-6"
    >
      <div class="space-y-2">
        <h3 class="text-lg font-extrabold tracking-tight text-ibbil-green transition-colors duration-300 group-hover:text-ibbil-green-dark sm:text-xl">
          {{ title }}
        </h3>
        <p
          v-if="hasDescription"
          class="line-clamp-2 text-sm leading-relaxed text-foreground-muted"
        >
          {{ description }}
        </p>
      </div>

      <ul
        v-if="hasMeta"
        class="flex flex-wrap items-center gap-x-5 gap-y-2"
        role="list"
      >
        <li
          v-for="(item, i) in meta"
          :key="i"
          class="inline-flex items-center gap-1.5 text-sm text-foreground-muted"
        >
          <Icon :name="item.icon" class="h-4 w-4 shrink-0 text-ibbil-gold" aria-hidden="true" />
          <span>{{ item.text }}</span>
        </li>
      </ul>

      <span
        v-if="ctaLabel"
        class="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-ibbil-green transition-colors duration-300 group-hover:text-ibbil-gold"
      >
        {{ ctaLabel }}
        <DirectionalArrow animated />
      </span>
    </div>

    <!-- Grid -->
    <template v-else>
      <!-- Grid: illustration media (e.g. category cards) -->
      <div
        v-if="hasIllustration"
        class="relative mx-auto mt-6 flex aspect-[391/282] w-full max-w-[9.5rem] items-center justify-center overflow-hidden sm:max-w-[11rem]"
        :class="animate ? 'marketplace-card-media' : undefined"
        :style="mediaAnimationStyle"
      >
        <img
          :src="illustration"
          alt=""
          class="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          width="392"
          height="282"
          loading="lazy"
          decoding="async"
        >
      </div>

      <!-- Grid: cover banner + overlapping avatar (e.g. store cards) -->
      <template v-else>
        <div class="relative h-28 w-full overflow-hidden sm:h-32">
          <img
            v-if="hasCover"
            :src="cover"
            alt=""
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            loading="lazy"
            decoding="async"
          >
          <div
            v-else
            class="h-full w-full bg-gradient-to-br from-ibbil-green/[0.14] via-ibbil-green/[0.06] to-ibbil-gold/[0.1]"
            aria-hidden="true"
          />
          <span
            class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent"
            aria-hidden="true"
          />
        </div>

        <div
          class="relative z-[1] -mt-10 flex justify-center"
          :class="animate ? 'marketplace-card-media' : undefined"
          :style="mediaAnimationStyle"
        >
          <span
            class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_8px_20px_-8px_rgba(45,83,61,0.4)] ring-4 ring-white transition-transform duration-300 group-hover:scale-[1.06]"
          >
            <img
              v-if="hasLogo"
              :src="logo"
              alt=""
              class="h-full w-full object-cover"
              loading="lazy"
              width="80"
              height="80"
            >
            <Icon
              v-else
              name="lucide:store"
              class="h-8 w-8 text-ibbil-green/40"
              aria-hidden="true"
            />
          </span>
        </div>
      </template>

      <!-- Grid: content -->
      <div
        class="flex w-full flex-1 flex-col items-center px-5 pb-5 sm:px-6"
        :class="hasIllustration ? 'pt-5' : 'pt-3'"
      >
        <h3
          class="text-base font-bold leading-snug text-ibbil-green transition-colors duration-300 group-hover:text-ibbil-green-dark sm:text-lg"
        >
          {{ title }}
        </h3>

        <p
          v-if="hasDescription"
          class="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground-muted"
        >
          {{ description }}
        </p>

        <ul
          v-if="hasMeta"
          class="mt-3 flex flex-wrap items-center justify-center gap-2"
          role="list"
        >
          <li
            v-for="(item, i) in meta"
            :key="i"
            class="inline-flex items-center gap-1.5 rounded-full bg-ibbil-green/[0.06] px-3 py-1 text-xs font-medium text-ibbil-green"
          >
            <Icon :name="item.icon" class="h-3.5 w-3.5 shrink-0 text-ibbil-gold" aria-hidden="true" />
            <span>{{ item.text }}</span>
          </li>
        </ul>

        <div v-if="gridFooterLabel" class="mt-auto w-full pt-4">
          <span
            class="flex items-center justify-center gap-1 border-t border-ibbil-green/10 pt-3.5 text-sm font-bold text-ibbil-green transition-colors duration-300 group-hover:text-ibbil-gold"
          >
            {{ gridFooterLabel }}
            <DirectionalArrow variant="chevron" animated />
          </span>
        </div>
      </div>
    </template>
  </NuxtLinkLocale>
</template>

<style scoped>
.marketplace-card-enter {
  animation: marketplace-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.marketplace-card-media {
  animation: marketplace-media-in 0.5s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}

@keyframes marketplace-fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes marketplace-media-in {
  from {
    opacity: 0;
    transform: scale(0.78);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marketplace-card-enter,
  .marketplace-card-media {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
