<script setup lang="ts">
import type { StoreCategory } from '@modules/stores/types'

const props = defineProps<{
  category: StoreCategory
  index?: number
  animate?: boolean
}>()

const { t } = useI18n()

const hasLogo = computed(() => Boolean(props.category.logo?.trim()))
</script>

<template>
  <NuxtLinkLocale
    :to="`/stores/${category.slug}`"
    class="group relative flex h-full flex-col items-center overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-ibbil-gold/50 hover:shadow-[0_18px_40px_-20px_rgba(45,83,61,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green focus-visible:ring-offset-2 sm:p-7"
    :class="animate ? 'stores-card' : undefined"
    :style="animate && index != null ? { animationDelay: `${120 + index * 55}ms` } : undefined"
  >
    <span
      class="pointer-events-none absolute inset-x-0 top-0 h-1 origin-center scale-x-0 rounded-b-full bg-ibbil-gold transition-transform duration-300 group-hover:scale-x-100"
      aria-hidden="true"
    />

    <div
      class="relative mb-5 flex aspect-square w-full max-w-[8.5rem] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-ibbil-green/[0.06] to-ibbil-green/[0.02] transition-colors duration-300 group-hover:from-ibbil-gold/[0.14] group-hover:to-ibbil-gold/[0.04] sm:max-w-[9.5rem]"
      :class="animate ? 'stores-icon' : undefined"
      :style="animate && index != null ? { animationDelay: `${180 + index * 55}ms` } : undefined"
    >
      <img
        v-if="hasLogo"
        :src="category.logo"
        alt=""
        class="h-[62%] w-[62%] object-contain transition-transform duration-300 group-hover:scale-[1.06]"
        loading="lazy"
        width="120"
        height="120"
      />
      <Icon
        v-else
        name="lucide:store"
        class="h-1/3 w-1/3 text-ibbil-green/70 transition-transform duration-300 group-hover:scale-[1.06]"
        aria-hidden="true"
      />
    </div>

    <h3
      class="text-base font-bold leading-snug text-ibbil-green transition-colors duration-300 group-hover:text-ibbil-green-dark sm:text-lg"
    >
      {{ category.name }}
    </h3>

    <span
      class="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ibbil-green transition-colors duration-300 group-hover:text-ibbil-gold"
    >
      {{ t('site.stores.exploreCategory') }}
      <DirectionalArrow animated />
    </span>
  </NuxtLinkLocale>
</template>
