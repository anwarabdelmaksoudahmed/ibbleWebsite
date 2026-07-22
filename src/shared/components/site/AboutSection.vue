<script setup lang="ts">
import { ROUTES } from '@shared/constants/routes'

const { t } = useI18n()

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

const pillars = [
  { key: 'mission', icon: 'lucide:target' },
  { key: 'vision', icon: 'lucide:eye' },
  { key: 'values', icon: 'lucide:gem' },
] as const

const highlights = [
  { key: 'marketplace', icon: 'lucide:store' },
  { key: 'services', icon: 'lucide:briefcase' },
  { key: 'secure', icon: 'lucide:shield-check' },
] as const

useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    if (entry?.isIntersecting) isVisible.value = true
  },
  { threshold: 0.06, rootMargin: '0px 0px -4% 0px' },
)
</script>

<template>
  <section
    ref="sectionRef"
    class="relative px-4 py-10 sm:px-6 sm:py-14 lg:px-6 lg:py-16"
    aria-labelledby="about-title"
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(212,160,68,0.14),transparent_68%)]"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-5xl space-y-8 sm:space-y-10">
      <!-- Page header -->
      <header
        class="text-center"
        :class="isVisible ? 'about-reveal' : 'opacity-0'"
      >
        <p class="mb-3 text-xs font-semibold tracking-[0.22em] text-ibbil-gold uppercase sm:text-sm">
          {{ t('auth.platformName') }}
        </p>
        <h1
          id="about-title"
          class="text-3xl font-extrabold tracking-tight text-ibbil-green sm:text-4xl"
        >
          {{ t('site.about.title') }}
        </h1>
        <div class="relative mx-auto mt-4 flex h-3 w-28 items-center justify-center" aria-hidden="true">
          <span class="h-px w-full bg-ibbil-green/25" />
          <span
            class="absolute h-1 w-10 rounded-full bg-ibbil-gold"
            :class="isVisible ? 'about-accent' : 'scale-x-0'"
          />
        </div>
        <p class="mx-auto mt-4 max-w-2xl text-sm leading-7 text-foreground-muted sm:text-base">
          {{ t('site.about.subtitle') }}
        </p>
      </header>

      <!-- Story -->
      <article
        class="overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white shadow-[0_24px_60px_-36px_rgba(45,83,61,0.45)]"
        :class="isVisible ? 'about-reveal' : 'opacity-0'"
        :style="isVisible ? { animationDelay: '80ms' } : undefined"
      >
        <div class="grid items-center gap-8 p-5 sm:p-8 lg:grid-cols-12 lg:gap-10 lg:p-10">
          <div class="lg:col-span-5">
            <div class="relative mx-auto max-w-sm lg:mx-0 lg:max-w-none">
              <div
                class="pointer-events-none absolute -inset-x-2 -inset-y-2 border border-ibbil-gold/30 sm:-inset-x-3 sm:-inset-y-3"
                aria-hidden="true"
              />
              <div
                class="pointer-events-none absolute -end-2 -top-2 h-12 w-12 border-e-2 border-t-2 border-ibbil-gold sm:h-14 sm:w-14"
                aria-hidden="true"
              />
              <div
                class="pointer-events-none absolute -bottom-2 -start-2 h-12 w-12 border-b-2 border-s-2 border-ibbil-green/35 sm:h-14 sm:w-14"
                aria-hidden="true"
              />
              <div class="relative aspect-[4/3] overflow-hidden bg-[#faf9f6] sm:aspect-square">
                <img
                  src="/images/hero/ibbil-hero-03.png"
                  :alt="t('site.about.imageAlt')"
                  class="absolute inset-0 h-full w-full object-cover object-[22%_center]"
                  width="1024"
                  height="768"
                  loading="eager"
                  fetchpriority="high"
                  decoding="async"
                >
              </div>
            </div>
          </div>

          <div class="lg:col-span-7">
            <p class="text-lg font-medium leading-relaxed text-ibbil-green sm:text-xl">
              {{ t('site.about.lead') }}
            </p>
            <p class="mt-4 text-sm leading-7 text-foreground-muted sm:text-base sm:leading-8">
              {{ t('site.about.body') }}
            </p>
          </div>
        </div>
      </article>

      <!-- Mission, vision, values -->
      <div
        class="space-y-6"
        :class="isVisible ? 'about-reveal' : 'opacity-0'"
        :style="isVisible ? { animationDelay: '140ms' } : undefined"
      >
        <header class="text-center">
          <h2 class="text-xl font-extrabold text-ibbil-green sm:text-2xl">
            {{ t('site.about.pillarsTitle') }}
          </h2>
          <p class="mx-auto mt-2 max-w-xl text-sm leading-6 text-foreground-muted">
            {{ t('site.about.pillarsSubtitle') }}
          </p>
        </header>

        <ul
          class="grid gap-5 sm:grid-cols-3"
          role="list"
        >
          <li
            v-for="(pillar, index) in pillars"
            :key="pillar.key"
            class="rounded-2xl border border-ibbil-green/10 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6"
            :class="isVisible ? 'about-reveal' : 'opacity-0'"
            :style="isVisible ? { animationDelay: `${200 + index * 70}ms` } : undefined"
          >
            <span
              class="mb-4 flex size-11 items-center justify-center rounded-xl bg-ibbil-green/8 text-ibbil-green"
              aria-hidden="true"
            >
              <Icon :name="pillar.icon" class="size-5" />
            </span>
            <h3 class="text-base font-bold text-ibbil-green">
              {{ t(`site.about.${pillar.key}.title`) }}
            </h3>
            <p class="mt-2 text-sm leading-6 text-foreground-muted">
              {{ t(`site.about.${pillar.key}.text`) }}
            </p>
          </li>
        </ul>
      </div>

      <!-- Highlights -->
      <div
        class="overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white p-5 sm:p-8 lg:p-10"
        :class="isVisible ? 'about-reveal' : 'opacity-0'"
        :style="isVisible ? { animationDelay: '260ms' } : undefined"
      >
        <header class="mb-8 text-center">
          <h2 class="text-xl font-extrabold text-ibbil-green sm:text-2xl">
            {{ t('site.about.highlightsTitle') }}
          </h2>
          <p class="mx-auto mt-2 max-w-xl text-sm leading-6 text-foreground-muted">
            {{ t('site.about.highlightsSubtitle') }}
          </p>
        </header>

        <ul
          class="grid gap-6 border-t border-ibbil-green/10 pt-8 sm:grid-cols-3"
          role="list"
        >
          <li
            v-for="(point, index) in highlights"
            :key="point.key"
            class="group flex flex-col gap-2 text-center sm:text-start"
            :class="isVisible ? 'about-reveal' : 'opacity-0'"
            :style="isVisible ? { animationDelay: `${320 + index * 70}ms` } : undefined"
          >
            <span
              class="mx-auto flex size-10 items-center justify-center text-ibbil-green transition-transform duration-300 group-hover:-translate-y-0.5 sm:mx-0"
              aria-hidden="true"
            >
              <Icon :name="point.icon" class="size-5" />
            </span>
            <h3 class="text-sm font-bold text-ibbil-green">
              {{ t(`site.home.highlights.${point.key}.title`) }}
            </h3>
            <p class="text-xs leading-relaxed text-foreground-muted sm:text-sm">
              {{ t(`site.home.highlights.${point.key}.text`) }}
            </p>
          </li>
        </ul>
      </div>

      <!-- CTA -->
      <aside
        class="overflow-hidden rounded-2xl border border-ibbil-green/10 bg-gradient-to-br from-ibbil-green/[0.06] via-white to-ibbil-gold/[0.08] p-6 text-center sm:p-8"
        :class="isVisible ? 'about-reveal' : 'opacity-0'"
        :style="isVisible ? { animationDelay: '400ms' } : undefined"
        aria-labelledby="about-cta-title"
      >
        <h2 id="about-cta-title" class="text-xl font-extrabold text-ibbil-green sm:text-2xl">
          {{ t('site.about.cta.title') }}
        </h2>
        <p class="mx-auto mt-2 max-w-lg text-sm leading-6 text-foreground-muted">
          {{ t('site.about.cta.subtitle') }}
        </p>
        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
          <NuxtLinkLocale
            to="/services"
            class="group inline-flex items-center gap-2 rounded-lg bg-ibbil-green px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-ibbil-green-dark hover:shadow-md hover:shadow-ibbil-green/20"
          >
            {{ t('site.about.cta.services') }}
            <DirectionalArrow animated />
          </NuxtLinkLocale>
          <NuxtLinkLocale
            :to="ROUTES.CONTACT"
            class="group inline-flex items-center gap-2 rounded-lg border border-ibbil-green/20 bg-white px-5 py-2.5 text-sm font-semibold text-ibbil-green transition-all duration-300 hover:-translate-y-0.5 hover:border-ibbil-green/35 hover:bg-ibbil-green/[0.04]"
          >
            {{ t('site.about.cta.contact') }}
            <DirectionalArrow animated />
          </NuxtLinkLocale>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.about-reveal {
  animation: about-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.about-accent {
  animation: about-scale-x 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
}

@keyframes about-fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes about-scale-x {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .about-reveal,
  .about-accent {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
