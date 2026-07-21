<script setup lang="ts">
import type { StoreProfile } from '@modules/stores/types'

const props = defineProps<{
  store: StoreProfile
}>()

const { t, n } = useI18n()

const stats = computed(() => [
  {
    key: 'products',
    icon: 'lucide:package',
    label: t('site.stores.profile.stats.products'),
    value: n(props.store.productsCount),
  },
  {
    key: 'views',
    icon: 'lucide:eye',
    label: t('site.stores.profile.stats.views'),
    value: n(props.store.viewsCount),
  },
  {
    key: 'reviews',
    icon: 'lucide:star',
    label: t('site.stores.profile.stats.reviews'),
    value: n(props.store.reviewsCount),
  },
  {
    key: 'favorites',
    icon: 'lucide:heart',
    label: t('site.stores.profile.stats.favorites'),
    value: n(props.store.favoritesCount),
  },
])
</script>

<template>
  <section
    class="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
    :aria-label="t('site.stores.profile.stats.label')"
  >
    <article
      v-for="stat in stats"
      :key="stat.key"
      class="rounded-2xl border border-ibbil-green/10 bg-white px-4 py-4 shadow-[0_8px_24px_-18px_rgba(45,83,61,0.35)] dark:border-ibbil-green/20 dark:bg-surface-elevated sm:px-5"
    >
      <div class="flex items-center gap-2 text-ibbil-gold">
        <Icon :name="stat.icon" class="h-4 w-4" aria-hidden="true" />
        <span class="text-xs font-medium text-foreground-muted sm:text-sm">
          {{ stat.label }}
        </span>
      </div>
      <p class="mt-2 text-xl font-extrabold tracking-tight text-ibbil-green sm:text-2xl">
        {{ stat.value }}
      </p>
    </article>
  </section>
</template>
