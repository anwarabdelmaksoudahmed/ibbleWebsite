<script setup lang="ts">
const { t } = useI18n()

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

const focusPoints = [
  { key: 'marketplace', icon: 'lucide:store' },
  { key: 'services', icon: 'lucide:briefcase' },
  { key: 'secure', icon: 'lucide:shield-check' },
] as const

useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    if (entry?.isIntersecting) isVisible.value = true
  },
  { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
)
</script>

<template>
  <section
    ref="sectionRef"
    class="relative overflow-hidden bg-white"
    aria-labelledby="home-about-title"
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-px origin-center bg-gradient-to-l from-transparent via-ibbil-gold/40 to-transparent"
      :class="isVisible ? 'about-line-expand' : 'scale-x-0'"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-6 lg:py-24">
      <div class="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <!-- Media -->
        <div class="lg:col-span-5">
          <div
            class="relative mx-auto max-w-md lg:mx-0 lg:max-w-none"
            :class="isVisible ? 'about-media-frame' : 'opacity-0'"
          >
            <div
              class="pointer-events-none absolute -inset-x-3 -inset-y-3 border border-ibbil-gold/35 sm:-inset-x-4 sm:-inset-y-4"
              :class="isVisible ? 'about-frame-border' : 'opacity-0'"
              aria-hidden="true"
            />
            <div
              class="pointer-events-none absolute -end-2 -top-2 h-16 w-16 border-e-2 border-t-2 border-ibbil-gold sm:-end-3 sm:-top-3"
              :class="isVisible ? 'about-corner about-corner-tr' : 'opacity-0'"
              aria-hidden="true"
            />
            <div
              class="pointer-events-none absolute -bottom-2 -start-2 h-16 w-16 border-b-2 border-s-2 border-ibbil-green/40 sm:-bottom-3 sm:-start-3"
              :class="isVisible ? 'about-corner about-corner-bl' : 'opacity-0'"
              aria-hidden="true"
            />

            <div class="relative aspect-square overflow-hidden bg-[#faf9f6]">
              <img
                src="/images/hero/ibbil-hero-03.png"
                :alt="t('site.home.about.imageAlt')"
                class="absolute inset-0 h-full w-full object-cover object-[22%_center]"
                :class="isVisible ? 'about-media-image' : 'opacity-0'"
                width="1024"
                height="341"
                loading="lazy"
                decoding="async"
              >
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="lg:col-span-7">
          <header
            class="mb-6"
            :class="isVisible ? 'about-reveal' : 'opacity-0'"
          >
            <p class="mb-3 text-xs font-semibold tracking-[0.22em] text-ibbil-gold uppercase sm:text-sm">
              {{ t('auth.platformName') }}
            </p>
            <h2
              id="home-about-title"
              class="text-3xl font-extrabold tracking-tight text-ibbil-green sm:text-4xl"
            >
              {{ t('site.home.about.title') }}
            </h2>
            <div class="relative mt-4 flex h-3 w-24 items-center" aria-hidden="true">
              <span class="h-px w-full bg-ibbil-green/20" />
              <span
                class="absolute h-1 w-10 origin-left rounded-full bg-ibbil-gold rtl:origin-right"
                :class="isVisible ? 'about-accent-grow' : 'scale-x-0'"
              />
            </div>
          </header>

          <p
            class="max-w-2xl text-lg font-medium leading-relaxed text-ibbil-green sm:text-xl sm:leading-relaxed"
            :class="isVisible ? 'about-reveal' : 'opacity-0'"
            :style="isVisible ? { animationDelay: '100ms' } : undefined"
          >
            {{ t('site.home.about.lead') }}
          </p>

          <p
            class="mt-4 max-w-2xl text-sm leading-7 text-foreground-muted sm:text-base sm:leading-8"
            :class="isVisible ? 'about-reveal' : 'opacity-0'"
            :style="isVisible ? { animationDelay: '200ms' } : undefined"
          >
            {{ t('site.home.about.body') }}
          </p>

          <ul
            class="mt-8 grid gap-5 border-t border-ibbil-green/10 pt-8 sm:grid-cols-3 sm:gap-6"
            :class="isVisible ? 'about-divider-in' : 'opacity-0'"
            role="list"
          >
            <li
              v-for="(point, index) in focusPoints"
              :key="point.key"
              class="group flex flex-col gap-2"
              :class="isVisible ? 'about-point' : 'opacity-0'"
              :style="isVisible ? { animationDelay: `${320 + index * 110}ms` } : undefined"
            >
              <span
                class="flex h-9 w-9 items-center justify-center text-ibbil-green transition-transform duration-300 group-hover:-translate-y-0.5"
                :class="isVisible ? 'about-icon-pop' : 'opacity-0'"
                :style="isVisible ? { animationDelay: `${380 + index * 110}ms` } : undefined"
              >
                <Icon :name="point.icon" class="h-5 w-5" aria-hidden="true" />
              </span>
              <span class="text-sm font-bold text-ibbil-green">
                {{ t(`site.home.highlights.${point.key}.title`) }}
              </span>
              <span class="text-xs leading-relaxed text-foreground-muted sm:text-sm">
                {{ t(`site.home.highlights.${point.key}.text`) }}
              </span>
            </li>
          </ul>

          <div
            class="mt-9 flex flex-wrap items-center gap-3"
            :class="isVisible ? 'about-reveal' : 'opacity-0'"
            :style="isVisible ? { animationDelay: '680ms' } : undefined"
          >
            <NuxtLinkLocale
              to="/services"
              class="group inline-flex items-center gap-2 rounded-lg bg-ibbil-green px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-ibbil-green-dark hover:shadow-md hover:shadow-ibbil-green/20"
            >
              {{ t('site.nav.services') }}
              <DirectionalArrow animated />
            </NuxtLinkLocale>
            <NuxtLinkLocale
              to="/about"
              class="group inline-flex items-center gap-2 px-2 py-2.5 text-sm font-semibold text-ibbil-green transition-colors duration-300 hover:text-ibbil-gold"
            >
              {{ t('site.home.about.cta') }}
              <DirectionalArrow animated />
            </NuxtLinkLocale>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-reveal {
  animation: about-fade-up 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.about-point {
  animation: about-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.about-icon-pop {
  animation: about-icon-in 0.55s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}

.about-divider-in {
  animation: about-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.24s both;
}

.about-line-expand {
  animation: about-scale-x 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.about-accent-grow {
  animation: about-scale-x 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
}

.about-media-frame {
  animation: about-media-fade 1.35s cubic-bezier(0.33, 1, 0.68, 1) 0.12s both;
}

.about-media-image {
  animation: about-media-settle 1.8s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
  will-change: transform, opacity;
}

.about-frame-border {
  animation: about-fade-only 1s ease-out 0.35s both;
}

.about-corner {
  animation: about-corner-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.about-corner-tr {
  animation-delay: 0.45s;
  transform-origin: top right;
}

.about-corner-bl {
  animation-delay: 0.55s;
  transform-origin: bottom left;
}

@keyframes about-fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes about-fade-only {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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

@keyframes about-icon-in {
  from {
    opacity: 0;
    transform: scale(0.7);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes about-corner-in {
  from {
    opacity: 0;
    transform: scale(0.65);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes about-media-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes about-media-settle {
  from {
    opacity: 0.4;
    transform: scale(1.06);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .about-reveal,
  .about-point,
  .about-icon-pop,
  .about-divider-in,
  .about-line-expand,
  .about-accent-grow,
  .about-media-frame,
  .about-media-image,
  .about-frame-border,
  .about-corner {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
