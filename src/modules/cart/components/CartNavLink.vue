<script setup lang="ts">
import { stripLocalePrefix } from '@shared/utils/locale-path'

withDefaults(
  defineProps<{
    /** Show text label beside the icon on large screens. */
    showLabel?: boolean
  }>(),
  {
    showLabel: false,
  },
)

const { t } = useI18n()
const route = useRoute()
const { authenticated } = useAuth()
const { itemCount } = useCart()

const displayCount = computed(() => {
  const count = itemCount.value
  if (count <= 0) return ''
  return count > 99 ? '99+' : String(count)
})

const showBadge = computed(() => authenticated.value && itemCount.value > 0)
const hasItems = computed(() => showBadge.value)
const isActive = computed(() => stripLocalePrefix(route.path) === '/cart')

const ariaLabel = computed(() =>
  showBadge.value
    ? t('site.commerce.cart.navWithCount', { count: itemCount.value })
    : t('site.nav.cart'),
)

const isAnimating = ref(false)
const showPulse = ref(false)
const previousCount = ref(0)
let animTimer: ReturnType<typeof setTimeout> | null = null

function triggerAddFeedback() {
  isAnimating.value = false
  showPulse.value = false

  requestAnimationFrame(() => {
    isAnimating.value = true
    showPulse.value = true
  })

  if (animTimer) clearTimeout(animTimer)
  animTimer = setTimeout(() => {
    isAnimating.value = false
    showPulse.value = false
  }, 700)
}

watch(itemCount, (next) => {
  if (next > previousCount.value && next > 0) {
    triggerAddFeedback()
  }
  previousCount.value = next
})

onBeforeUnmount(() => {
  if (animTimer) clearTimeout(animTimer)
})
</script>

<template>
  <NuxtLinkLocale
    to="/cart"
    class="cart-nav-link group relative inline-flex size-10 items-center justify-center rounded-2xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ibbil-green"
    :class="[
      isActive
        ? 'bg-white/18 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
        : 'text-white/88 hover:bg-white/[0.12] hover:text-white',
      showLabel ? 'w-auto gap-2 px-3' : undefined,
      hasItems ? 'cart-nav-link--filled' : undefined,
      isAnimating ? 'cart-nav-link--animating' : undefined,
    ]"
    :aria-label="ariaLabel"
    :aria-current="isActive ? 'page' : undefined"
  >
    <!-- Soft ambient glow when cart has items -->
    <span
      class="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300"
      :class="hasItems ? 'bg-gradient-to-br from-ibbil-gold/15 via-transparent to-transparent opacity-100' : undefined"
      aria-hidden="true"
    />

    <span class="relative z-[1] inline-flex size-6 items-center justify-center">
      <Icon
        name="lucide:shopping-cart"
        class="cart-nav-icon size-5"
        :class="hasItems ? 'text-white' : undefined"
        aria-hidden="true"
      />

      <!-- Ripple ring on add -->
      <span
        v-if="showPulse"
        class="cart-nav-pulse pointer-events-none absolute -end-1 -top-1 size-5 rounded-full border-2 border-ibbil-gold"
        aria-hidden="true"
      />

      <Transition name="cart-badge">
        <span
          v-if="showBadge"
          class="cart-nav-badge pointer-events-none absolute -end-2.5 -top-2.5 z-[2] flex h-5 min-w-5 items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-[#e0b35a] to-ibbil-gold px-1.5 text-[11px] font-extrabold leading-none tabular-nums text-ibbil-green-dark shadow-[0_2px_10px_rgba(212,160,68,0.55)] ring-2 ring-ibbil-green"
          :class="{ 'cart-nav-badge--bump': isAnimating }"
          aria-hidden="true"
        >
          <Transition name="cart-count" mode="out-in">
            <span :key="displayCount" class="block">
              {{ displayCount }}
            </span>
          </Transition>
        </span>
      </Transition>
    </span>

    <span
      v-if="showLabel"
      class="relative z-[1] hidden text-sm font-semibold tracking-tight lg:inline"
    >
      {{ t('site.nav.cart') }}
    </span>

    <span class="sr-only" aria-live="polite" aria-atomic="true">
      <template v-if="showBadge">
        {{ t('site.commerce.cart.navWithCount', { count: itemCount }) }}
      </template>
    </span>
  </NuxtLinkLocale>
</template>

<style scoped>
.cart-nav-icon {
  transition: transform 0.25s cubic-bezier(0.34, 1.4, 0.64, 1);
  transform-origin: 50% 60%;
}

.cart-nav-link:hover .cart-nav-icon {
  transform: translateY(-1px) scale(1.06);
}

.cart-nav-link:active .cart-nav-icon {
  transform: scale(0.92);
}

.cart-nav-link--animating .cart-nav-icon {
  animation: cart-icon-jiggle 0.65s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

.cart-nav-link--filled:not(.cart-nav-link--animating) .cart-nav-icon {
  filter: drop-shadow(0 0 6px rgba(212, 160, 68, 0.35));
}

/* Badge appear / disappear */
.cart-badge-enter-active {
  transition:
    opacity 0.28s ease,
    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cart-badge-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.cart-badge-enter-from {
  opacity: 0;
  transform: scale(0.2) translateY(6px);
}

.cart-badge-leave-to {
  opacity: 0;
  transform: scale(0.4) translateY(-4px);
}

/* Count digit swap */
.cart-count-enter-active,
.cart-count-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.cart-count-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.cart-count-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Add-to-cart bump */
.cart-nav-badge--bump {
  animation: cart-badge-bump 0.55s cubic-bezier(0.34, 1.55, 0.64, 1);
}

.cart-nav-pulse {
  animation: cart-pulse-ring 0.65s ease-out forwards;
}

@keyframes cart-icon-jiggle {
  0% {
    transform: rotate(0deg) scale(1);
  }
  18% {
    transform: rotate(-12deg) scale(1.12);
  }
  36% {
    transform: rotate(10deg) scale(1.08);
  }
  54% {
    transform: rotate(-6deg) scale(1.04);
  }
  72% {
    transform: rotate(4deg) scale(1.02);
  }
  100% {
    transform: rotate(0deg) scale(1);
  }
}

@keyframes cart-badge-bump {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.4);
  }
  55% {
    transform: scale(0.88);
  }
  75% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes cart-pulse-ring {
  0% {
    opacity: 0.9;
    transform: scale(0.6);
  }
  100% {
    opacity: 0;
    transform: scale(2.4);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cart-nav-link--animating .cart-nav-icon,
  .cart-nav-badge--bump,
  .cart-nav-pulse {
    animation: none;
  }

  .cart-badge-enter-active,
  .cart-badge-leave-active,
  .cart-count-enter-active,
  .cart-count-leave-active,
  .cart-nav-icon {
    transition: none;
  }

  .cart-nav-link:hover .cart-nav-icon {
    transform: none;
  }
}
</style>
