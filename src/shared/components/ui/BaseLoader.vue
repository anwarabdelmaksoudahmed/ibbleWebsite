<script setup lang="ts">
import type { ComponentSize } from '@shared/types/ui'
import IbbilMark from '@shared/components/site/IbbilMark.vue'
import { cn } from '@shared/utils/cn'

export type BaseLoaderProps = {
  size?: ComponentSize
  /** Accessible + optional visible label */
  label?: string
  /** Show label next to / under the spinner */
  showLabel?: boolean
  /** Centered block for section / page loading */
  block?: boolean
  /** Brand-colored spinner for public site surfaces */
  tone?: 'default' | 'brand'
}

const props = withDefaults(defineProps<BaseLoaderProps>(), {
  size: 'md',
  label: undefined,
  showLabel: false,
  block: false,
  tone: 'default',
})

const { t } = useI18n()

const resolvedLabel = computed(() => props.label ?? t('common.loading'))

const sizeClasses: Record<ComponentSize, { box: string, ring: string }> = {
  xs: { box: 'size-3', ring: 'border' },
  sm: { box: 'size-4', ring: 'border-2' },
  md: { box: 'size-6', ring: 'border-2' },
  lg: { box: 'size-8', ring: 'border-[2.5px]' },
  xl: { box: 'size-10', ring: 'border-[3px]' },
}

/**
 * Large brand loaders (public section / page loading) render the official
 * Ibbil camel mark inside the orbiting rings instead of a plain spinner.
 */
const showMark = computed(
  () => props.tone === 'brand' && (props.size === 'lg' || props.size === 'xl'),
)

const markBoxClasses = computed(() =>
  props.size === 'xl' ? 'size-20' : 'size-16',
)
</script>

<template>
  <div
    role="status"
    :aria-label="resolvedLabel"
    :class="cn(
      'inline-flex items-center gap-2.5',
      block && 'flex w-full flex-col justify-center gap-4 py-16',
      tone === 'brand' ? 'text-ibbil-green' : 'text-foreground-muted',
    )"
  >
    <!-- Brand identity loader: camel mark + orbiting green/gold arcs -->
    <div
      v-if="showMark"
      :class="cn('relative shrink-0', markBoxClasses)"
      aria-hidden="true"
    >
      <!-- Soft brand halo -->
      <div class="absolute inset-0 rounded-full bg-gradient-to-br from-ibbil-green/[0.08] to-ibbil-green/[0.02]" />
      <!-- Static track -->
      <div class="absolute inset-0 rounded-full border-2 border-ibbil-green/10" />
      <!-- Green orbiting arc -->
      <div class="loader-arc absolute inset-0 rounded-full border-2 border-transparent border-t-ibbil-green" />
      <!-- Gold counter-orbiting arc -->
      <div class="loader-arc-accent absolute -inset-1.5 rounded-full border-2 border-transparent border-b-ibbil-gold/80" />
      <!-- Ibbil camel mark -->
      <div class="absolute inset-0 flex items-center justify-center">
        <IbbilMark
          :class="cn(
            'loader-mark w-auto text-ibbil-green',
            size === 'xl' ? 'h-10' : 'h-8',
          )"
        />
      </div>
    </div>

    <!-- Compact spinner (inputs, buttons, small inline loading) -->
    <div
      v-else
      :class="cn('relative shrink-0', sizeClasses[size].box)"
      aria-hidden="true"
    >
      <div
        :class="cn(
          'absolute inset-0 rounded-full border-current opacity-15',
          sizeClasses[size].ring,
        )"
      />
      <div
        :class="cn(
          'loader-arc absolute inset-0 rounded-full border-transparent border-t-current',
          sizeClasses[size].ring,
        )"
      />
    </div>

    <span
      v-if="showLabel || block"
      class="inline-flex items-baseline text-sm font-medium"
      :class="showMark && 'font-semibold text-ibbil-green-dark'"
    >
      {{ resolvedLabel }}
      <span
        v-if="block"
        class="ms-0.5 inline-flex items-baseline gap-0.5"
        aria-hidden="true"
      >
        <span class="loader-dot size-1 rounded-full bg-current" />
        <span class="loader-dot size-1 rounded-full bg-current" />
        <span class="loader-dot size-1 rounded-full bg-current" />
      </span>
    </span>
    <span v-else class="sr-only">{{ resolvedLabel }}</span>
  </div>
</template>

<style scoped>
.loader-arc {
  animation: loader-spin 0.9s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;
}

.loader-arc-accent {
  animation: loader-spin-reverse 1.4s linear infinite;
}

.loader-mark {
  transform-origin: 50% 100%;
  animation: loader-mark-walk 1.6s ease-in-out infinite;
}

.loader-dot {
  animation: loader-dot-fade 1.2s ease-in-out infinite;
}

.loader-dot:nth-child(2) {
  animation-delay: 0.18s;
}

.loader-dot:nth-child(3) {
  animation-delay: 0.36s;
}

@keyframes loader-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes loader-spin-reverse {
  to {
    transform: rotate(-360deg);
  }
}

/* Gentle camel "stride": a soft bob + sway, like a walking gait */
@keyframes loader-mark-walk {
  0%,
  100% {
    transform: translateY(0) rotate(0deg) scale(1);
  }
  25% {
    transform: translateY(-2px) rotate(-2.5deg) scale(1.02);
  }
  50% {
    transform: translateY(0) rotate(0deg) scale(1);
  }
  75% {
    transform: translateY(-2px) rotate(2.5deg) scale(1.02);
  }
}

@keyframes loader-dot-fade {
  0%,
  80%,
  100% {
    opacity: 0.25;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .loader-arc {
    animation-duration: 2.5s;
  }

  .loader-arc-accent,
  .loader-mark,
  .loader-dot {
    animation: none;
  }

  .loader-dot {
    opacity: 0.6;
  }
}
</style>
