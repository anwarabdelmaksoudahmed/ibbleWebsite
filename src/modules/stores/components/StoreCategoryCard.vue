<script setup lang="ts">
import MarketplaceCard from '@shared/components/site/MarketplaceCard.vue'
import type { MarketplaceCardVariant } from '@shared/types/marketplace-card'
import type { StoreCategory } from '@modules/stores/types'
import { STORES_ROUTES } from '@modules/stores/constants/routes'

const props = withDefaults(
  defineProps<{
    category: StoreCategory
    variant?: MarketplaceCardVariant
    index?: number
    animate?: boolean
  }>(),
  {
    variant: 'grid',
    animate: false,
  },
)

const { t } = useI18n()

const to = computed(() => STORES_ROUTES.CATEGORY(props.category.slug))
</script>

<template>
  <MarketplaceCard
    :to="to"
    :title="category.name"
    :description="category.description || category.content"
    :logo="category.logo"
    :cover="category.cover"
    :variant="variant"
    :cta-label="t('site.stores.exploreCategory')"
    :index="index"
    :animate="animate"
  />
</template>
