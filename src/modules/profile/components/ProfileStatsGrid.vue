<script setup lang="ts">
import type { ProfileStat, ProfileStatKey } from '@modules/profile/types'

defineProps<{
  stats: ProfileStat[]
  loading?: boolean
  formatValue: (key: ProfileStatKey, value: number | null) => string
  labelFor: (key: ProfileStatKey) => string
}>()

const { t } = useI18n()
</script>

<template>
  <section :aria-label="t('site.profile.stats.label')">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 sm:gap-4">
      <BaseStatCard
        v-for="stat in stats"
        :key="stat.key"
        :label="labelFor(stat.key)"
        :icon="stat.icon"
        :accent="stat.accent"
        :loading="loading"
        :empty="!loading && stat.value == null"
        :value="stat.value == null ? null : formatValue(stat.key, stat.value)"
      >
        <template v-if="stat.key === 'wallet' && stat.value != null" #value>
          <span class="inline-flex items-baseline gap-1">
            <span>{{ formatValue(stat.key, stat.value) }}</span>
            <SaudiRiyalSymbol class="text-xs font-semibold text-foreground-muted" />
          </span>
        </template>
      </BaseStatCard>
    </div>
  </section>
</template>
