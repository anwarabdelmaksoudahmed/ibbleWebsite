<script setup lang="ts">
import MediaListingShell from '@modules/media/components/MediaListingShell.vue'
import MediaArticleCard from '@modules/media/components/MediaArticleCard.vue'

const { t } = useI18n()
const {
  items,
  hasItems,
  isLoading,
  errorMessage,
  refresh,
  page,
  totalPages,
  setPage,
} = useMediaEvents()

const showRefreshOverlay = computed(() => isLoading.value && hasItems.value)
</script>

<template>
  <MediaListingShell
    title-id="media-events-title"
    :title="t('site.media.events.title')"
    :subtitle="t('site.media.events.subtitle')"
    :is-loading="isLoading"
    :has-items="hasItems"
    :error-message="errorMessage"
    :error-title="t('site.media.events.errorTitle')"
    :empty-title="t('site.media.events.emptyTitle')"
    :empty-description="t('site.media.events.emptyDescription')"
    empty-icon="lucide:calendar-days"
    :page="page"
    :total-pages="totalPages"
    :show-refresh-overlay="showRefreshOverlay"
    @retry="refresh()"
    @update:page="setPage"
  >
    <template #default="{ animate }">
      <ul role="list" class="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        <li v-for="(article, index) in items" :key="article.id">
          <MediaArticleCard
            :article="article"
            kind="events"
            :index="index"
            :animate="animate"
            :eager="index < 3"
          />
        </li>
      </ul>
    </template>
  </MediaListingShell>
</template>
