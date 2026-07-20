<script setup lang="ts">
import { cn } from '@shared/utils/cn'

export type BaseStatCardProps = {
  label: string
  value?: string | number | null
  icon?: string
  loading?: boolean
  empty?: boolean
  emptyLabel?: string
  accent?: 'green' | 'gold' | 'neutral'
}

withDefaults(defineProps<BaseStatCardProps>(), {
  value: null,
  icon: 'lucide:activity',
  loading: false,
  empty: false,
  emptyLabel: '—',
  accent: 'green',
})

const accentIcon = {
  green: 'bg-ibbil-green/[0.08] text-ibbil-green',
  gold: 'bg-ibbil-gold/15 text-ibbil-gold',
  neutral: 'bg-surface-muted text-foreground-muted',
} as const
</script>

<template>
  <article
    :class="cn(
      'group relative flex flex-col overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white p-4 shadow-[0_8px_24px_-18px_rgba(45,83,61,0.35)] transition-all duration-300 dark:border-ibbil-green/20 dark:bg-surface-elevated sm:p-5',
      !loading && 'hover:-translate-y-0.5 hover:border-ibbil-gold/40 hover:shadow-[0_18px_36px_-20px_rgba(45,83,61,0.45)]',
    )"
  >
    <span
      class="pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-center scale-x-0 bg-ibbil-gold transition-transform duration-300 group-hover:scale-x-100"
      aria-hidden="true"
    />

    <div class="flex items-start justify-between gap-3">
      <div
        :class="cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 sm:size-11',
          accentIcon[accent],
        )"
        aria-hidden="true"
      >
        <Icon :name="icon" class="size-5" />
      </div>

      <BaseSkeleton
        v-if="loading"
        width="3.5rem"
        height="1.75rem"
        rounded="lg"
        class="ms-auto"
      />
      <p
        v-else
        class="text-end text-xl font-extrabold tracking-tight text-ibbil-green tabular-nums sm:text-2xl"
      >
        <slot v-if="$slots.value" name="value" />
        <template v-else-if="empty || value == null">{{ emptyLabel }}</template>
        <template v-else>{{ value }}</template>
      </p>
    </div>

    <BaseSkeleton
      v-if="loading"
      class="mt-3"
      width="70%"
      height="0.875rem"
    />
    <p
      v-else
      class="mt-3 text-sm font-medium text-foreground-muted"
    >
      {{ label }}
    </p>
  </article>
</template>
