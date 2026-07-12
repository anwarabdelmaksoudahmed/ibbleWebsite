<script setup lang="ts">
import type { MarketplaceCardVariant } from '@shared/types/marketplace-card'

withDefaults(
  defineProps<{
    variant?: MarketplaceCardVariant
    count?: number
  }>(),
  {
    variant: 'list',
    count: 4,
  },
)
</script>

<template>
  <ul
    role="list"
    aria-busy="true"
    :class="
      variant === 'grid'
        ? 'grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5'
        : 'flex flex-col gap-3 sm:gap-4'
    "
  >
    <li
      v-for="i in count"
      :key="i"
      class="overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white"
      :class="variant === 'list' ? 'flex flex-col sm:flex-row' : 'flex flex-col items-center p-6 sm:p-7'"
    >
      <template v-if="variant === 'list'">
        <BaseSkeleton width="100%" height="9rem" rounded="sm" class="sm:w-[38%] sm:min-h-[9rem]" />
        <div class="flex flex-1 flex-col justify-center gap-3 p-5">
          <BaseSkeleton width="40%" height="1.5rem" />
          <BaseSkeleton width="85%" height="1rem" />
          <BaseSkeleton width="50%" height="1rem" />
        </div>
      </template>
      <template v-else>
        <BaseSkeleton width="8.5rem" height="8.5rem" rounded="lg" class="mb-5" />
        <BaseSkeleton width="60%" height="1.25rem" />
        <BaseSkeleton width="40%" height="0.875rem" class="mt-3" />
      </template>
    </li>
  </ul>
</template>
