<script setup lang="ts">
import { HOME_SERVICE_LINKS } from '@shared/constants/site-nav'

const { t } = useI18n()

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

const serviceKey = (navKey: string) => navKey.replace('site.nav.', '')

useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    if (entry?.isIntersecting) isVisible.value = true
  },
  { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
)
</script>

<template>
  <section
    ref="sectionRef"
    class="relative overflow-hidden bg-[#f4f6f5]"
    aria-labelledby="home-services-title"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.35]"
      aria-hidden="true"
      style="
        background-image: radial-gradient(rgba(45, 83, 61, 0.06) 1px, transparent 1px);
        background-size: 22px 22px;
      "
    />

    <div class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-6 lg:py-24">
      <header
        class="mx-auto mb-12 max-w-2xl text-center"
        :class="isVisible ? 'services-reveal' : 'opacity-0'"
      >
        <p class="mb-3 text-xs font-semibold tracking-[0.22em] text-ibbil-gold uppercase sm:text-sm">
          {{ t('site.home.servicesEyebrow') }}
        </p>
        <h2
          id="home-services-title"
          class="text-2xl font-extrabold tracking-tight text-ibbil-green sm:text-3xl"
        >
          {{ t('site.home.servicesTitle') }}
        </h2>
        <div class="relative mx-auto mt-3 flex h-3 w-28 items-center justify-center" aria-hidden="true">
          <span class="h-px w-full bg-ibbil-green/20" />
          <span
            class="absolute h-1 w-10 origin-center rounded-full bg-ibbil-gold"
            :class="isVisible ? 'services-accent-grow' : 'scale-x-0'"
          />
        </div>
        <p
          class="mt-4 text-sm leading-relaxed text-foreground-muted sm:text-base"
          :class="isVisible ? 'services-reveal' : 'opacity-0'"
          :style="isVisible ? { animationDelay: '100ms' } : undefined"
        >
          {{ t('site.home.servicesSubtitle') }}
        </p>
      </header>

      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5" role="list">
        <li
          v-for="(link, index) in HOME_SERVICE_LINKS"
          :key="link.key"
          :class="isVisible ? 'services-card' : 'opacity-0'"
          :style="isVisible ? { animationDelay: `${160 + index * 70}ms` } : undefined"
        >
          <NuxtLinkLocale
            :to="link.to"
            class="group relative flex h-full flex-col rounded-2xl border border-ibbil-green/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ibbil-gold/45 hover:shadow-[0_12px_32px_-16px_rgba(45,83,61,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green focus-visible:ring-offset-2"
          >
            <span
              class="pointer-events-none absolute inset-x-6 top-0 h-0.5 origin-center scale-x-0 rounded-full bg-ibbil-gold transition-transform duration-300 group-hover:scale-x-100"
              aria-hidden="true"
            />

            <span
              class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-ibbil-green/8 text-ibbil-green transition-all duration-300 group-hover:bg-ibbil-gold/20 group-hover:text-ibbil-green-dark"
              :class="isVisible ? 'services-icon' : 'opacity-0'"
              :style="isVisible ? { animationDelay: `${220 + index * 70}ms` } : undefined"
            >
              <Icon v-if="link.icon" :name="link.icon" class="h-6 w-6" aria-hidden="true" />
            </span>

            <span class="mb-2 text-base font-bold text-ibbil-green transition-colors duration-300 group-hover:text-ibbil-green-dark sm:text-lg">
              {{ t(link.key) }}
            </span>

            <span class="mb-6 flex-1 text-sm leading-relaxed text-foreground-muted">
              {{ t(`site.home.serviceItems.${serviceKey(link.key)}`) }}
            </span>

            <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-ibbil-green transition-colors duration-300 group-hover:text-ibbil-gold">
              {{ t('site.home.exploreService') }}
              <Icon
                name="lucide:arrow-left"
                class="h-4 w-4 transition-transform duration-300 rtl:rotate-180 ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </NuxtLinkLocale>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.services-reveal {
  animation: services-fade-up 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.services-card {
  animation: services-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.services-icon {
  animation: services-icon-in 0.55s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}

.services-accent-grow {
  animation: services-scale-x 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
}

@keyframes services-fade-up {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes services-icon-in {
  from {
    opacity: 0;
    transform: scale(0.72);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes services-scale-x {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .services-reveal,
  .services-card,
  .services-icon,
  .services-accent-grow {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
