<script setup lang="ts">
import { ROUTES } from '@shared/constants/routes'

definePageMeta({
  layout: 'site',
})

const { t } = useI18n()

useSeoMeta({
  title: () => t('site.home.seoTitle'),
  description: () => t('site.home.seoDescription'),
})

type HeroSlide = {
  src: string
  altKey: 'desert' | 'portrait' | 'dunes' | 'caravan'
}

const heroSlides: HeroSlide[] = [
  { src: '/images/hero/camel-1.jpg', altKey: 'desert' },
  { src: '/images/hero/camel-2.jpg', altKey: 'portrait' },
  { src: '/images/hero/camel-3.jpg', altKey: 'dunes' },
  { src: '/images/hero/camel-4.jpg', altKey: 'caravan' },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative isolate overflow-hidden">
      <BaseSwiper
        :items="heroSlides"
        :height="410"
        effect="fade"
        loop
        ken-burns
        :autoplay="{ delay: 5200, pauseOnMouseEnter: true }"
        controls-variant="brand"
        controls-position="overlay-bottom"
        :label="t('site.home.hero.slidesLabel')"
        class="w-full"
      >
        <template #slide="{ item, index }">
          <div class="relative h-full w-full bg-ibbil-green-dark">
            <img
              :src="item.src"
              :alt="t(`site.home.hero.slides.${item.altKey}`)"
              class="absolute inset-0 h-full w-full object-cover"
              width="1920"
              height="1080"
              :loading="index === 0 ? 'eager' : 'lazy'"
              :fetchpriority="index === 0 ? 'high' : 'auto'"
              decoding="async"
            >
          </div>
        </template>

        <template #overlay>
          <div class="relative flex h-full items-center">
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-l from-ibbil-green-dark/25 via-ibbil-green-dark/55 to-ibbil-green-dark/88"
              aria-hidden="true"
            />
            <div
              class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,_rgba(212,160,68,0.22),_transparent_50%)]"
              aria-hidden="true"
            />

            <div class="relative z-[1] mx-auto w-full max-w-7xl px-4 py-8 pb-14 pointer-events-auto sm:px-6 sm:pb-12">
              <div class="max-w-xl space-y-3 text-white sm:space-y-4">
                <p class="hero-fade-in text-xs font-semibold tracking-[0.22em] text-ibbil-gold uppercase sm:text-sm">
                  {{ t('auth.platformName') }}
                </p>

                <h1 class="hero-fade-in text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                  {{ t('site.home.heroTitle') }}
                </h1>

                <p class="hero-fade-in max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
                  {{ t('site.home.heroSubtitle') }}
                </p>

                <div class="hero-fade-in flex flex-wrap gap-2.5 pt-1">
                  <NuxtLinkLocale
                    :to="ROUTES.AUTH.LOGIN"
                    class="inline-flex items-center gap-2 rounded-lg bg-ibbil-gold px-4 py-2.5 text-sm font-bold text-ibbil-green-dark shadow-md shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-ibbil-gold-hover"
                  >
                    {{ t('auth.login') }}
                    <Icon name="lucide:arrow-left" class="h-4 w-4 rtl:rotate-180" />
                  </NuxtLinkLocale>
                  <NuxtLinkLocale
                    to="/services"
                    class="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                  >
                    {{ t('site.nav.services') }}
                  </NuxtLinkLocale>
                </div>
              </div>
            </div>
          </div>
        </template>
      </BaseSwiper>
    </section>

    <HomeAboutSection />
    <HomeServicesSection />
    <HomeStatsSection />
  </div>
</template>

<style scoped>
.hero-fade-in {
  animation: hero-fade-up 0.55s ease-out both;
}

.hero-fade-in:nth-child(1) {
  animation-delay: 60ms;
}
.hero-fade-in:nth-child(2) {
  animation-delay: 120ms;
}
.hero-fade-in:nth-child(3) {
  animation-delay: 180ms;
}
.hero-fade-in:nth-child(4) {
  animation-delay: 240ms;
}

@keyframes hero-fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-fade-in {
    animation: none;
  }
}
</style>
