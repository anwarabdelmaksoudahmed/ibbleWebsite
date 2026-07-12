<script setup lang="ts">
import MarketplaceCard from '@shared/components/site/MarketplaceCard.vue'
import type { MarketplaceCardMetaItem, MarketplaceCardVariant } from '@shared/types/marketplace-card'
import type { Store } from '@modules/stores/types'
import { STORES_ROUTES } from '@modules/stores/constants/routes'

const props = withDefaults(
  defineProps<{
    store: Store
    categorySlug: string
    variant?: MarketplaceCardVariant
    index?: number
    animate?: boolean
  }>(),
  {
    variant: 'list',
    animate: false,
  },
)

const { t, n } = useI18n()

const to = computed(() => STORES_ROUTES.STORE(props.categorySlug, props.store.slug))

const meta = computed<MarketplaceCardMetaItem[]>(() => {
  const items: MarketplaceCardMetaItem[] = []

  if (props.store.cityName) {
    items.push({
      icon: 'lucide:map-pin',
      text: props.store.cityName,
    })
  }

  if (props.store.productsCount > 0) {
    items.push({
      icon: 'lucide:package',
      text: t('site.stores.productsCount', { count: n(props.store.productsCount) }),
    })
  }

  return items
})
</script>

<template>
  <MarketplaceCard
    :to="to"
    :title="store.name"
    :description="store.description"
    :logo="store.logo"
    :cover="store.cover"
    :variant="variant"
    :meta="meta"
    :cta-label="t('site.stores.exploreStore')"
    :index="index"
    :animate="animate"
  />
</template>
