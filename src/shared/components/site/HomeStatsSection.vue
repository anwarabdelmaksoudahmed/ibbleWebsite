<script setup lang="ts">
const { t } = useI18n()

const stats = [
  { key: 'insurance', value: 100 },
  { key: 'purchases', value: 220 },
  { key: 'transport', value: 150 },
  { key: 'merchants', value: 50 },
  { key: 'products', value: 300 },
  { key: 'doctors', value: 70 },
] as const

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

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
    class="relative overflow-hidden bg-white"
    aria-labelledby="home-stats-title"
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-px origin-center bg-gradient-to-l from-transparent via-ibbil-gold/40 to-transparent"
      :class="isVisible ? 'stats-line-expand' : 'scale-x-0'"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-6 lg:py-24">
      <header
        class="mb-12 text-center"
        :class="isVisible ? 'stats-reveal' : 'opacity-0'"
      >
        <p class="mb-3 text-xs font-semibold tracking-[0.22em] text-ibbil-gold uppercase sm:text-sm">
          {{ t('auth.platformName') }}
        </p>
        <h2
          id="home-stats-title"
          class="text-2xl font-extrabold tracking-tight text-ibbil-green sm:text-3xl"
        >
          {{ t('site.home.stats.title') }}
        </h2>
        <div class="relative mx-auto mt-3 flex h-3 w-28 items-center justify-center" aria-hidden="true">
          <span class="h-px w-full bg-ibbil-green/20" />
          <span
            class="absolute h-1 w-10 origin-center rounded-full bg-ibbil-gold"
            :class="isVisible ? 'stats-accent-grow' : 'scale-x-0'"
          />
        </div>
      </header>

      <ul
        class="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-6"
        role="list"
      >
        <li
          v-for="(stat, index) in stats"
          :key="stat.key"
          class="group flex flex-col items-center text-center"
          :class="isVisible ? 'stats-item' : 'opacity-0'"
          :style="isVisible ? { animationDelay: `${160 + index * 80}ms` } : undefined"
        >
          <p
            class="text-3xl font-extrabold tracking-tight text-ibbil-green tabular-nums sm:text-4xl"
            :class="isVisible ? 'stats-value' : 'opacity-0'"
            :style="isVisible ? { animationDelay: `${220 + index * 80}ms` } : undefined"
            :aria-label="`${stat.value} ${t(`site.home.stats.items.${stat.key}`)}`"
          >
            <BaseCountUp :to="stat.value" :duration="1400 + index * 80" />
          </p>
          <p
            class="mt-2 max-w-[9.5rem] text-sm font-medium leading-snug text-ibbil-green/80 sm:text-[0.95rem]"
            :class="isVisible ? 'stats-reveal' : 'opacity-0'"
            :style="isVisible ? { animationDelay: `${280 + index * 80}ms` } : undefined"
          >
            {{ t(`site.home.stats.items.${stat.key}`) }}
          </p>
          <span
            class="mt-3 h-0.5 w-8 origin-center rounded-full bg-ibbil-gold"
            :class="isVisible ? 'stats-underline' : 'scale-x-0'"
            :style="isVisible ? { animationDelay: `${340 + index * 80}ms` } : undefined"
            aria-hidden="true"
          />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.stats-reveal {
  animation: stats-fade-up 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.stats-item {
  animation: stats-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.stats-value {
  animation: stats-value-in 0.65s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}

.stats-line-expand {
  animation: stats-scale-x 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.stats-accent-grow {
  animation: stats-scale-x 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
}

.stats-underline {
  animation: stats-scale-x 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes stats-fade-up {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes stats-value-in {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes stats-scale-x {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stats-reveal,
  .stats-item,
  .stats-value,
  .stats-line-expand,
  .stats-accent-grow,
  .stats-underline {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
