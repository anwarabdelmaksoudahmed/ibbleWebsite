<script setup lang="ts">
import { ROUTES } from '@shared/constants/routes'
import {
  SERVICES_HUB_HERO,
  SERVICES_HUB_HOW_IMAGE,
  SERVICES_HUB_ITEMS,
  SERVICES_HUB_STEPS,
} from '@shared/constants/services-hub'

const { t } = useI18n()
const localePath = useLocalePath()

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    if (entry?.isIntersecting) isVisible.value = true
  },
  { threshold: 0.06, rootMargin: '0px 0px -4% 0px' },
)

function goToJoin() {
  return navigateTo(localePath(ROUTES.JOIN))
}
</script>

<template>
  <section
    ref="sectionRef"
    class="bg-[#f4f6f5]"
    aria-labelledby="services-hub-title"
    :data-visible="isVisible"
  >
    <!-- Hero -->
    <div class="relative isolate overflow-hidden">
      <div class="relative h-[min(70vh,410px)] w-full bg-ibbil-green-dark sm:h-[410px]">
        <img
          :src="SERVICES_HUB_HERO.src"
          :alt="t('site.services.images.hero')"
          class="absolute inset-0 h-full w-full object-cover object-[center_40%]"
          :width="SERVICES_HUB_HERO.width"
          :height="SERVICES_HUB_HERO.height"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        >
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-l from-ibbil-green-dark/30 via-ibbil-green-dark/60 to-ibbil-green-dark/90"
          aria-hidden="true"
        />
        <div
          class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,_rgba(212,160,68,0.22),_transparent_50%)]"
          aria-hidden="true"
        />

        <div class="relative z-[1] mx-auto flex h-full w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-6">
          <div class="max-w-2xl text-white">
            <p class="hero-fade mb-3 text-xs font-semibold tracking-[0.22em] text-ibbil-gold uppercase sm:text-sm">
              {{ t('auth.platformName') }}
            </p>
            <h1
              id="services-hub-title"
              class="hero-fade text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl"
            >
              {{ t('site.services.heroTitle') }}
            </h1>
            <p class="hero-fade mt-3 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
              {{ t('site.services.heroSubtitle') }}
            </p>
            <div class="hero-fade mt-5 flex flex-wrap gap-2.5">
              <a
                href="#services-list"
                class="inline-flex items-center gap-2 rounded-lg bg-ibbil-gold px-4 py-2.5 text-sm font-bold text-ibbil-green-dark transition-all hover:bg-ibbil-gold-hover"
              >
                {{ t('site.services.ctaExplore') }}
                <DirectionalArrow animated />
              </a>
              <NuxtLinkLocale
                :to="ROUTES.JOIN"
                class="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                {{ t('site.nav.joinMerchant') }}
              </NuxtLinkLocale>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Services grid -->
    <div id="services-list" class="relative scroll-mt-24 overflow-hidden">
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden="true"
        style="
          background-image: radial-gradient(rgba(45, 83, 61, 0.06) 1px, transparent 1px);
          background-size: 22px 22px;
        "
      />

      <div class="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-6 lg:py-20">
        <header class="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <p class="section-fade mb-3 text-xs font-semibold tracking-[0.22em] text-ibbil-gold uppercase sm:text-sm">
            {{ t('site.services.eyebrow') }}
          </p>
          <h2 class="section-fade text-2xl font-extrabold tracking-tight text-ibbil-green sm:text-3xl">
            {{ t('site.services.listTitle') }}
          </h2>
          <div class="relative mx-auto mt-3 flex h-3 w-28 items-center justify-center" aria-hidden="true">
            <span class="h-px w-full bg-ibbil-green/20" />
            <span class="absolute h-1 w-10 origin-center rounded-full bg-ibbil-gold section-accent" />
          </div>
          <p
            class="section-fade mt-4 text-sm leading-relaxed text-foreground-muted sm:text-base"
            style="animation-delay: 80ms"
          >
            {{ t('site.services.listSubtitle') }}
          </p>
        </header>

        <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5" role="list">
          <li
            v-for="(item, index) in SERVICES_HUB_ITEMS"
            :key="item.key"
            class="section-fade"
            :style="{ animationDelay: `${120 + index * 70}ms` }"
          >
            <NuxtLinkLocale
              :to="item.to"
              class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-ibbil-gold/45 hover:shadow-[0_16px_40px_-18px_rgba(45,83,61,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green focus-visible:ring-offset-2"
            >
              <span class="relative aspect-[16/10] overflow-hidden bg-ibbil-green-dark/10">
                <img
                  :src="item.image"
                  :alt="t(`site.services.items.${item.key}.imageAlt`)"
                  class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  :width="item.width"
                  :height="item.height"
                  loading="lazy"
                  decoding="async"
                >
                <span
                  class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ibbil-green-dark/55 via-transparent to-transparent"
                  aria-hidden="true"
                />
                <span
                  class="absolute start-3 bottom-3 flex size-10 items-center justify-center rounded-xl bg-white/95 text-ibbil-green shadow-sm backdrop-blur-sm transition-colors duration-300 group-hover:bg-ibbil-gold group-hover:text-ibbil-green-dark"
                  aria-hidden="true"
                >
                  <Icon :name="item.icon" class="size-5" />
                </span>
              </span>

              <span class="flex flex-1 flex-col p-5 sm:p-6">
                <span class="mb-2 text-base font-bold text-ibbil-green transition-colors duration-300 group-hover:text-ibbil-green-dark sm:text-lg">
                  {{ t(`site.nav.${item.key}`) }}
                </span>
                <span class="mb-5 flex-1 text-sm leading-relaxed text-foreground-muted">
                  {{ t(`site.services.items.${item.key}.description`) }}
                </span>
                <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-ibbil-green transition-colors duration-300 group-hover:text-ibbil-gold">
                  {{ t('site.home.exploreService') }}
                  <DirectionalArrow animated />
                </span>
              </span>
            </NuxtLinkLocale>
          </li>
        </ul>
      </div>
    </div>

    <!-- How it works -->
    <div class="border-t border-ibbil-green/8 bg-white">
      <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-6 lg:py-20">
        <div class="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div class="section-fade lg:col-span-5" style="animation-delay: 80ms">
            <div class="relative mx-auto max-w-md lg:mx-0 lg:max-w-none">
              <div
                class="pointer-events-none absolute -inset-x-2 -inset-y-2 border border-ibbil-gold/30 sm:-inset-x-3 sm:-inset-y-3"
                aria-hidden="true"
              />
              <div
                class="pointer-events-none absolute -end-2 -top-2 h-12 w-12 border-e-2 border-t-2 border-ibbil-gold sm:h-14 sm:w-14"
                aria-hidden="true"
              />
              <div class="relative aspect-[3/2] overflow-hidden bg-[#faf9f6]">
                <img
                  :src="SERVICES_HUB_HOW_IMAGE.src"
                  :alt="t('site.services.images.howToApply')"
                  class="absolute inset-0 h-full w-full object-cover"
                  :width="SERVICES_HUB_HOW_IMAGE.width"
                  :height="SERVICES_HUB_HOW_IMAGE.height"
                  loading="lazy"
                  decoding="async"
                >
              </div>
            </div>
          </div>

          <div class="lg:col-span-7">
            <p class="section-fade mb-3 text-xs font-semibold tracking-[0.22em] text-ibbil-gold uppercase sm:text-sm">
              {{ t('site.services.howEyebrow') }}
            </p>
            <h2 class="section-fade text-2xl font-extrabold tracking-tight text-ibbil-green sm:text-3xl">
              {{ t('site.services.howTitle') }}
            </h2>
            <p
              class="section-fade mt-3 max-w-xl text-sm leading-relaxed text-foreground-muted sm:text-base"
              style="animation-delay: 60ms"
            >
              {{ t('site.services.howSubtitle') }}
            </p>

            <ol class="mt-8 space-y-5" role="list">
              <li
                v-for="(step, index) in SERVICES_HUB_STEPS"
                :key="step.key"
                class="section-fade flex gap-4"
                :style="{ animationDelay: `${120 + index * 80}ms` }"
              >
                <span
                  class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ibbil-green/8 text-ibbil-green"
                  aria-hidden="true"
                >
                  <Icon :name="step.icon" class="size-5" />
                </span>
                <div>
                  <h3 class="text-base font-bold text-ibbil-green">
                    {{ t(`site.services.steps.${step.key}.title`) }}
                  </h3>
                  <p class="mt-1 text-sm leading-relaxed text-foreground-muted">
                    {{ t(`site.services.steps.${step.key}.description`) }}
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer CTA -->
    <div class="relative h-[410px] overflow-hidden bg-ibbil-gold text-ibbil-green-dark">
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden="true"
        style="
          background-image: radial-gradient(rgba(31, 58, 43, 0.08) 1px, transparent 1px);
          background-size: 22px 22px;
        "
      />

      <div class="relative mx-auto flex h-full max-w-7xl items-center px-4 py-10 sm:px-6 sm:py-12 lg:px-6">
        <div class="grid w-full items-center gap-5 lg:grid-cols-[1.3fr_auto]">
          <div class="section-fade">
            <p class="text-xs font-semibold tracking-[0.22em] text-ibbil-green-dark/70 uppercase sm:text-sm">
              {{ t('auth.platformName') }}
            </p>
            <h2 class="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {{ t('site.services.footerTitle') }}
            </h2>
            <div class="relative mt-3 flex h-3 w-24 items-center" aria-hidden="true">
              <span class="h-px w-full bg-ibbil-green-dark/20" />
              <span class="absolute h-1 w-10 origin-left rounded-full bg-ibbil-green-dark rtl:origin-right" />
            </div>
            <p class="mt-4 max-w-3xl text-sm leading-relaxed text-ibbil-green-dark/80 sm:text-base">
              {{ t('site.services.footerDescription') }}
            </p>
          </div>
          <BaseButton
            variant="brand"
            class="section-fade !rounded-lg !px-5 !py-2.5 !text-sm !font-bold lg:justify-self-start"
            @click="goToJoin"
          >
            {{ t('site.nav.joinMerchant') }}
            <DirectionalArrow animated />
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-fade {
  animation: hub-fade-up 0.55s ease-out both;
}

.hero-fade:nth-child(1) {
  animation-delay: 60ms;
}
.hero-fade:nth-child(2) {
  animation-delay: 120ms;
}
.hero-fade:nth-child(3) {
  animation-delay: 180ms;
}
.hero-fade:nth-child(4) {
  animation-delay: 240ms;
}

.section-fade {
  opacity: 0;
  transform: translateY(14px);
}

section[data-visible='true'] .section-fade {
  animation: hub-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.section-accent {
  transform: scaleX(0);
}

section[data-visible='true'] .section-accent {
  animation: hub-scale-x 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
}

@keyframes hub-fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes hub-scale-x {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-fade,
  section[data-visible='true'] .section-fade,
  section[data-visible='true'] .section-accent {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
