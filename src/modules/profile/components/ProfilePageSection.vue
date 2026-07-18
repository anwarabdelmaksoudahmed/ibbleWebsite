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
  <ProfileStatsGrid
    :stats="stats"
    :loading="isLoading"
    :format-value="formatStatValue"
    :label-for="labelFor"
  />
</template>
