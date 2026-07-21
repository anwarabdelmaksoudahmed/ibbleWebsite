<script setup lang="ts">
import IbbilMark from '@shared/components/site/IbbilMark.vue'
import { cn } from '@shared/utils/cn'

export type BaseEmptyStateProps = {
  title?: string
  description?: string
  icon?: string
  /** `brand` matches public marketplace surfaces */
  variant?: 'default' | 'brand'
}

withDefaults(defineProps<BaseEmptyStateProps>(), {
  title: undefined,
  description: undefined,
  icon: 'lucide:inbox',
  variant: 'default',
})

const { t } = useI18n()
</script>

<template>
  <div
    class="empty-state relative flex flex-col items-center justify-center overflow-hidden px-4 py-14 text-center sm:py-16"
    role="status"
  >
    <!-- Soft radial brand wash behind the composition (brand only) -->
    <div
      v-if="variant === 'brand'"
      class="pointer-events-none absolute inset-x-0 top-6 mx-auto h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(45,83,61,0.06)_0%,rgba(212,160,68,0.04)_45%,transparent_70%)] sm:h-64 sm:w-64"
      aria-hidden="true"
    />

    <!-- ============ Brand composition: Ibbil camel + contextual badge ============ -->
    <div
      v-if="variant === 'brand'"
      class="empty-state__icon relative mb-6"
      aria-hidden="true"
    >
      <!-- Slow-rotating dashed orbit -->
      <div class="empty-state__orbit absolute -inset-4 rounded-full border border-dashed border-ibbil-green/15 sm:-inset-5" />
      <!-- Outer halo -->
      <div class="absolute -inset-8 rounded-full border border-ibbil-green/[0.06] sm:-inset-10" />

      <!-- Main identity well with the camel mark -->
      <div class="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-b from-ibbil-green/[0.1] via-ibbil-green/[0.05] to-ibbil-gold/[0.06] ring-1 ring-ibbil-green/10 shadow-[0_14px_34px_-16px_rgba(45,83,61,0.4)] sm:size-24">
        <!-- Desert dune line inside the well -->
        <div class="absolute inset-x-3 bottom-4 h-px rounded-full bg-gradient-to-r from-transparent via-ibbil-gold/40 to-transparent sm:bottom-5" />
        <IbbilMark class="empty-state__mark h-9 w-auto text-ibbil-green sm:h-11" />
      </div>

      <!-- Contextual icon badge (overlapping, RTL-safe) -->
      <div class="empty-state__badge absolute -bottom-1.5 -end-1.5 flex size-9 items-center justify-center rounded-full bg-white text-ibbil-gold ring-1 ring-ibbil-green/10 shadow-[0_8px_20px_-8px_rgba(45,83,61,0.45)] sm:size-10">
        <Icon :name="icon" class="size-4.5 sm:size-5" />
      </div>

      <!-- Floating accent dots -->
      <span class="empty-state__dot absolute -top-2 start-1 size-2 rounded-full bg-ibbil-gold/70" />
      <span class="empty-state__dot absolute top-6 -start-4 size-1.5 rounded-full bg-ibbil-green/25" />
      <span class="empty-state__dot absolute -top-4 end-5 size-1 rounded-full bg-ibbil-gold/40" />
    </div>

    <!-- ============ Default (admin / neutral) composition ============ -->
    <div
      v-else
      class="empty-state__icon relative mb-5"
      aria-hidden="true"
    >
      <div class="absolute -inset-2.5 rounded-full border border-border sm:-inset-3" />
      <div class="relative flex size-16 items-center justify-center rounded-full bg-surface-muted text-foreground-muted ring-1 ring-border sm:size-[4.5rem]">
        <Icon :name="icon" class="size-7 sm:size-8" />
      </div>
    </div>

    <h3
      :class="cn(
        'empty-state__title relative text-base font-bold sm:text-lg',
        variant === 'brand' ? 'text-ibbil-green-dark' : 'text-foreground',
      )"
    >
      {{ title ?? t('common.noResults') }}
    </h3>

    <!-- Gold separator flourish (brand only) -->
    <div
      v-if="variant === 'brand'"
      class="empty-state__title relative mt-2.5 flex items-center gap-1.5"
      aria-hidden="true"
    >
      <span class="h-px w-6 rounded-full bg-gradient-to-r from-transparent to-ibbil-gold/60" />
      <span class="size-1 rounded-full bg-ibbil-gold/80" />
      <span class="h-px w-6 rounded-full bg-gradient-to-l from-transparent to-ibbil-gold/60" />
    </div>

    <p class="empty-state__description relative mt-2 max-w-md text-sm leading-relaxed text-foreground-muted">
      {{ description ?? t('common.emptyDescription') }}
    </p>

    <div
      v-if="$slots.default"
      class="empty-state__actions relative mt-6 flex flex-wrap items-center justify-center gap-3"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.empty-state__icon,
.empty-state__title,
.empty-state__description,
.empty-state__actions {
  animation: empty-state-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.empty-state__title {
  animation-delay: 80ms;
}

.empty-state__description {
  animation-delay: 150ms;
}

.empty-state__actions {
  animation-delay: 230ms;
}

/* Camel gently breathes */
.empty-state__mark {
  transform-origin: 50% 100%;
  animation: empty-state-breathe 4.5s ease-in-out infinite;
}

/* Badge pops in after the rise */
.empty-state__badge {
  animation: empty-state-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.35s both;
}

.empty-state__orbit {
  animation: empty-state-orbit 40s linear infinite;
}

.empty-state__dot {
  animation: empty-state-float 3.4s ease-in-out infinite;
}

.empty-state__dot:nth-of-type(2) {
  animation-delay: 0.9s;
  animation-duration: 4s;
}

.empty-state__dot:nth-of-type(3) {
  animation-delay: 1.7s;
  animation-duration: 4.6s;
}

@keyframes empty-state-rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes empty-state-breathe {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.04) translateY(-1px);
  }
}

@keyframes empty-state-pop {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes empty-state-orbit {
  to {
    transform: rotate(360deg);
  }
}

@keyframes empty-state-float {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.9;
  }
  50% {
    transform: translateY(-5px);
    opacity: 0.45;
  }
}

@media (prefers-reduced-motion: reduce) {
  .empty-state__icon,
  .empty-state__title,
  .empty-state__description,
  .empty-state__actions,
  .empty-state__mark,
  .empty-state__badge,
  .empty-state__orbit,
  .empty-state__dot {
    animation: none;
  }
}
</style>
