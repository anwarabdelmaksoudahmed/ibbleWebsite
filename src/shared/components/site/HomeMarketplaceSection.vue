<script setup lang="ts">
import {
  HOME_MARKETPLACE_CATEGORIES,
  homeMarketplaceCategoryTo,
} from '@shared/constants/home-marketplace'

const { t } = useI18n()

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    if (entry?.isIntersecting) isVisible.value = true
  },
  { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
)
</script>

<template>
  <section
    ref="sectionRef"
    class="relative overflow-hidden bg-white"
    aria-labelledby="home-marketplace-title"
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-px origin-center bg-gradient-to-l from-transparent via-ibbil-gold/40 to-transparent"
      :class="isVisible ? 'market-line-expand' : 'scale-x-0'"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-6 lg:py-24">
      <header
        class="mx-auto mb-10 max-w-2xl text-center sm:mb-12"
        :class="isVisible ? 'market-reveal' : 'opacity-0'"
      >
        <p class="mb-3 text-xs font-semibold tracking-[0.22em] text-ibbil-gold uppercase sm:text-sm">
          {{ t('site.home.marketplaceEyebrow') }}
        </p>
        <h2
          id="home-marketplace-title"
          class="text-2xl font-extrabold tracking-tight text-ibbil-green sm:text-3xl"
        >
          {{ t('site.home.marketplaceTitle') }}
        </h2>
        <div class="relative mx-auto mt-3 flex h-3 w-28 items-center justify-center" aria-hidden="true">
          <span class="h-px w-full bg-ibbil-green/20" />
          <span
            class="absolute h-1 w-10 origin-center rounded-full bg-ibbil-gold"
            :class="isVisible ? 'market-accent-grow' : 'scale-x-0'"
          />
        </div>
        <p
          class="mt-4 text-sm leading-relaxed text-foreground-muted sm:text-base"
          :class="isVisible ? 'market-reveal' : 'opacity-0'"
          :style="isVisible ? { animationDelay: '100ms' } : undefined"
        >
          {{ t('site.home.marketplaceSubtitle') }}
        </p>
      </header>

      <ul
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5"
        role="list"
      >
        <li
          v-for="(category, index) in HOME_MARKETPLACE_CATEGORIES"
          :key="category.key"
          :class="isVisible ? 'market-card' : 'opacity-0'"
          :style="isVisible ? { animationDelay: `${140 + index * 60}ms` } : undefined"
        >
          <NuxtLinkLocale
            :to="homeMarketplaceCategoryTo(category.slug)"
            class="group flex h-full flex-col items-center rounded-2xl border border-ibbil-green/10 bg-[#fafbfa] p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-ibbil-gold/45 hover:bg-white hover:shadow-[0_12px_32px_-16px_rgba(45,83,61,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green focus-visible:ring-offset-2 sm:p-5"
          >
            <span
              class="mb-3 flex aspect-[391/282] w-full max-w-[9.5rem] items-center justify-center overflow-hidden sm:max-w-[11rem]"
              :class="isVisible ? 'market-image' : 'opacity-0'"
              :style="isVisible ? { animationDelay: `${180 + index * 60}ms` } : undefined"
            >
              <img
                :src="category.image"
                :alt="t(`site.home.marketplaceCategories.${category.key}.alt`)"
                class="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                width="392"
                height="282"
                loading="lazy"
                decoding="async"
              >
            </span>

            <span class="text-sm font-bold text-ibbil-green transition-colors duration-300 group-hover:text-ibbil-green-dark sm:text-base">
              {{ t(`site.home.marketplaceCategories.${category.key}.title`) }}
            </span>

            <span class="mt-1.5 line-clamp-2 text-xs leading-relaxed text-foreground-muted sm:text-sm">
              {{ t(`site.home.marketplaceCategories.${category.key}.text`) }}
            </span>
          </NuxtLinkLocale>
        </li>
      </ul>

      <div
        class="mt-10 text-center"
        :class="isVisible ? 'market-reveal' : 'opacity-0'"
        :style="isVisible ? { animationDelay: '620ms' } : undefined"
      >
        <NuxtLinkLocale
          to="/stores"
          class="group inline-flex items-center gap-2 rounded-lg border border-ibbil-green/20 bg-white px-5 py-2.5 text-sm font-semibold text-ibbil-green transition-all duration-300 hover:-translate-y-0.5 hover:border-ibbil-gold/50 hover:text-ibbil-gold"
        >
          {{ t('site.home.marketplaceCta') }}
          <DirectionalArrow animated />
        </NuxtLinkLocale>
      </div>
    </div>
  </section>
</template>

<style scoped>
.market-reveal {
  animation: market-fade-up 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.market-card {
  animation: market-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.market-image {
  animation: market-image-in 0.6s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}

.market-line-expand {
  animation: market-scale-x 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.market-accent-grow {
  animation: market-scale-x 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
}

@keyframes market-fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes market-image-in {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes market-scale-x {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .market-reveal,
  .market-card,
  .market-image,
  .market-line-expand,
  .market-accent-grow {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
