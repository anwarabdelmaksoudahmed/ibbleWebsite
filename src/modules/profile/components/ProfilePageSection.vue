<script setup lang="ts">
import type { ProfileStatKey } from '@modules/profile/types'

const { t } = useI18n()

const {
  stats,
  formatStatValue,
  isLoading,
} = useProfile()

function labelFor(key: ProfileStatKey) {
  return t(`site.profile.stats.${key}`)
}
</script>

<template>
  <div class="space-y-6 sm:space-y-7">
    <ProfileStatsGrid
      :stats="stats"
      :loading="isLoading"
      :format-value="formatStatValue"
      :label-for="labelFor"
    />

    <ClientOnly>
      <LazyProfileActivityChart
        :stats="stats"
        :loading="isLoading"
        :label-for="labelFor"
      />
      <template #fallback>
        <div
          class="h-80 animate-pulse rounded-2xl border border-ibbil-green/10 bg-white dark:bg-surface-elevated"
          aria-hidden="true"
        />
      </template>
    </ClientOnly>
  </div>
</template>
