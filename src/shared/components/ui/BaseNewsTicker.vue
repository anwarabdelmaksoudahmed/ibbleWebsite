<script setup lang="ts">
import type { NewsTickerItem } from '@shared/types/news-ticker.types'

export type { NewsTickerItem }

const props = withDefaults(
  defineProps<{
    items: NewsTickerItem[]
    /** Full loop duration in seconds */
    duration?: number
    pauseOnHover?: boolean
  }>(),
  {
    duration: 42,
    pauseOnHover: true,
  },
)

const rootRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const prefersReducedMotion = usePreferredReducedMotion()

useIntersectionObserver(
  rootRef,
  ([entry]) => {
    isVisible.value = entry?.isIntersecting ?? false
  },
  { threshold: 0 },
)

const shouldAnimate = computed(
  () =>
    props.items.length > 0
    && isVisible.value
    && prefersReducedMotion.value !== 'reduce',
)

const loopItems = computed(() =>
  shouldAnimate.value ? [...props.items, ...props.items] : props.items,
)

const tickerStyle = computed(() => ({
  '--ticker-duration': `${props.duration}s`,
}))
</script>

<template>
  <div
    ref="rootRef"
    class="ticker-root relative min-w-0 flex-1"
    :class="[
      shouldAnimate ? 'ticker-root--animated' : 'ticker-root--static',
      pauseOnHover && 'ticker-root--pausable',
    ]"
    :style="tickerStyle"
  >
    <div
      class="ticker-viewport overflow-hidden"
      aria-hidden="true"
    >
      <ul
        class="ticker-track flex w-max list-none gap-0 p-0 m-0"
        :class="{ 'ticker-track--run': shouldAnimate }"
        role="list"
      >
        <li
          v-for="(item, index) in loopItems"
          :key="`${item.id}-${index}`"
          class="ticker-item flex shrink-0 items-center"
        >
          <NuxtLinkLocale
            v-if="item.href"
            :to="item.href"
            class="group inline-flex items-center gap-2 whitespace-nowrap px-5 py-1 text-sm font-medium transition-colors duration-200 hover:text-ibbil-gold focus-visible:text-ibbil-gold"
          >
            <Icon
              v-if="item.icon"
              :name="item.icon"
              class="size-3.5 shrink-0 opacity-80"
              aria-hidden="true"
            />
            <span>{{ item.label }}</span>
          </NuxtLinkLocale>

          <span
            v-else
            class="inline-flex items-center gap-2 whitespace-nowrap px-5 py-1 text-sm font-medium"
          >
            <Icon
              v-if="item.icon"
              :name="item.icon"
              class="size-3.5 shrink-0 opacity-80"
              aria-hidden="true"
            />
            <span>{{ item.label }}</span>
          </span>

          <span
            class="ticker-separator mx-1 size-1 shrink-0 rounded-full bg-current opacity-35"
            aria-hidden="true"
          />
        </li>
      </ul>
    </div>

    <ul class="sr-only" role="list">
      <li v-for="item in items" :key="item.id">
        <NuxtLinkLocale v-if="item.href" :to="item.href">
          {{ item.label }}
        </NuxtLinkLocale>
        <span v-else>{{ item.label }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.ticker-viewport {
  mask-image: linear-gradient(
    to right,
    transparent,
    black 6%,
    black 94%,
    transparent
  );
}

.ticker-track--run {
  animation: ticker-scroll var(--ticker-duration, 42s) linear infinite;
  will-change: transform;
}

.ticker-root--pausable:hover .ticker-track--run,
.ticker-root--pausable:focus-within .ticker-track--run {
  animation-play-state: paused;
}

@keyframes ticker-scroll {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(-50%, 0, 0);
  }
}

[dir='rtl'] .ticker-track--run {
  animation-name: ticker-scroll-rtl;
}

@keyframes ticker-scroll-rtl {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(50%, 0, 0);
  }
}

[dir='rtl'] .ticker-viewport {
  mask-image: linear-gradient(
    to left,
    transparent,
    black 6%,
    black 94%,
    transparent
  );
}

@media (prefers-reduced-motion: reduce) {
  .ticker-track--run {
    animation: none;
    will-change: auto;
  }
}
</style>
