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
    variant?: MarketplaceCardVariant
    meta?: MarketplaceCardMetaItem[]
    ctaLabel?: string
    index?: number
    animate?: boolean
  }>(),
  {
    description: '',
    logo: '',
    cover: '',
    variant: 'grid',
    meta: () => [],
    ctaLabel: '',
    animate: false,
  },
)

const hasLogo = computed(() => Boolean(props.logo?.trim()))
const hasCover = computed(() => Boolean(props.cover?.trim()))
const hasDescription = computed(() => Boolean(props.description?.trim()))
const hasMeta = computed(() => props.meta.length > 0)
const isList = computed(() => props.variant === 'list')

const animationStyle = computed(() =>
  props.animate && props.index != null
    ? { animationDelay: `${120 + props.index * 55}ms` }
    : undefined,
)
</script>

<template>
  <NuxtLinkLocale
    :to="to"
    class="marketplace-card group relative overflow-hidden border border-ibbil-green/10 bg-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green focus-visible:ring-offset-2"
    :class="[
      animate ? 'marketplace-card-enter' : undefined,
      isList
        ? 'flex flex-col rounded-2xl shadow-[0_10px_30px_-18px_rgba(45,83,61,0.35)] hover:-translate-y-0.5 hover:border-ibbil-gold/40 hover:shadow-[0_22px_44px_-22px_rgba(45,83,61,0.45)] sm:flex-row sm:items-stretch'
        : 'flex h-full flex-col items-center rounded-2xl p-6 text-center shadow-[0_8px_28px_-18px_rgba(45,83,61,0.3)] hover:-translate-y-1.5 hover:border-ibbil-gold/50 hover:shadow-[0_18px_40px_-20px_rgba(45,83,61,0.45)] sm:p-7',
    ]"
    :style="animationStyle"
  >
    <span
      class="pointer-events-none absolute inset-x-0 top-0 h-1 origin-center scale-x-0 rounded-b-full bg-ibbil-gold transition-transform duration-300 group-hover:scale-x-100"
      aria-hidden="true"
    />

    <!-- List: media -->
    <div
      v-if="isList"
      class="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gradient-to-br from-ibbil-green/[0.08] to-ibbil-green/[0.02] sm:aspect-auto sm:w-[38%] sm:min-w-[12rem] sm:max-w-[18rem]"
    >
      <img
        v-if="hasCover"
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

    <!-- Grid: media + content -->
    <template v-else>
      <div
        class="relative mb-5 flex aspect-square w-full max-w-[8.5rem] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-ibbil-green/[0.06] to-ibbil-green/[0.02] transition-colors duration-300 group-hover:from-ibbil-gold/[0.14] group-hover:to-ibbil-gold/[0.04] sm:max-w-[9.5rem]"
        :class="animate ? 'marketplace-card-icon' : undefined"
        :style="
          animate && index != null
            ? { animationDelay: `${180 + index * 55}ms` }
            : undefined
        "
      >
        <img
          v-if="hasCover"
          :src="cover"
          alt=""
          class="absolute inset-0 h-full w-full object-cover opacity-30"
          loading="lazy"
        >
        <img
          v-if="hasLogo"
          :src="logo"
          alt=""
          class="relative z-[1] h-[62%] w-[62%] object-contain transition-transform duration-300 group-hover:scale-[1.06]"
          loading="lazy"
          width="120"
          height="120"
        >
        <Icon
          v-else
          name="lucide:store"
          class="relative z-[1] h-1/3 w-1/3 text-ibbil-green/70 transition-transform duration-300 group-hover:scale-[1.06]"
          aria-hidden="true"
        />
      </div>

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
        class="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5"
        role="list"
      >
        <li
          v-for="(item, i) in meta"
          :key="i"
          class="inline-flex items-center gap-1 text-xs text-foreground-muted"
        >
          <Icon :name="item.icon" class="h-3.5 w-3.5 shrink-0 text-ibbil-gold" aria-hidden="true" />
          <span>{{ item.text }}</span>
        </li>
      </ul>

      <span
        v-if="ctaLabel"
        class="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ibbil-green transition-colors duration-300 group-hover:text-ibbil-gold"
      >
        {{ ctaLabel }}
        <DirectionalArrow animated />
      </span>
    </template>
  </NuxtLinkLocale>
</template>

<style scoped>
.marketplace-card-enter {
  animation: marketplace-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.marketplace-card-icon {
  animation: marketplace-icon-in 0.5s cubic-bezier(0.34, 1.4, 0.64, 1) both;
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

@keyframes marketplace-icon-in {
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
  .marketplace-card-icon {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
