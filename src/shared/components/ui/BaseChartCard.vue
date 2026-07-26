<script setup lang="ts">
import { cn } from '@shared/utils/cn'

defineProps<{
  title: string
  description?: string
  loading?: boolean
  empty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: string
}>()
</script>

<template>
  <article
    :class="cn(
      'relative overflow-hidden rounded-2xl border border-ibbil-green/15 bg-white',
      'shadow-[0_12px_32px_-22px_rgba(45,83,61,0.45)] dark:bg-surface-elevated',
    )"
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-ibbil-green via-ibbil-gold to-ibbil-green"
      aria-hidden="true"
    />

    <div class="p-5 sm:p-6">
      <header class="mb-5 flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-base font-bold text-ibbil-green sm:text-lg">
            {{ title }}
          </h2>
          <p v-if="description" class="mt-1 text-sm text-foreground-muted">
            {{ description }}
          </p>
        </div>
        <slot name="actions" />
      </header>

      <div
        v-if="loading"
        class="flex min-h-[16rem] flex-col items-center justify-center gap-4"
        aria-busy="true"
      >
        <div class="relative size-36 sm:size-40">
          <div class="absolute inset-0 animate-pulse rounded-full border-[14px] border-ibbil-green/10" />
          <div class="absolute inset-4 animate-pulse rounded-full border-[10px] border-ibbil-gold/15" />
        </div>
        <div class="h-3 w-40 animate-pulse rounded-full bg-ibbil-green/10" />
      </div>

      <BaseEmptyState
        v-else-if="empty"
        variant="brand"
        :icon="emptyIcon || 'lucide:pie-chart'"
        :title="emptyTitle"
        :description="emptyDescription"
        class="!py-10"
      />

      <slot v-else />
    </div>
  </article>
</template>
