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
} = useMediaNews()

const showRefreshOverlay = computed(() => isLoading.value && hasItems.value)
</script>

<template>
  <MediaListingShell
    title-id="media-news-title"
    :title="t('site.media.news.title')"
    :subtitle="t('site.media.news.subtitle')"
    :is-loading="isLoading"
    :has-items="hasItems"
    :error-message="errorMessage"
    :error-title="t('site.media.news.errorTitle')"
    :empty-title="t('site.media.news.emptyTitle')"
    :empty-description="t('site.media.news.emptyDescription')"
    empty-icon="lucide:newspaper"
    :page="page"
    :total-pages="totalPages"
    :show-refresh-overlay="showRefreshOverlay"
    @retry="refresh()"
    @update:page="setPage"
  >
    <template #default="{ animate }">
      <ul
        role="list"
        class="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
      >
        <li v-for="(article, index) in items" :key="article.id">
          <MediaArticleCard
            :article="article"
            kind="news"
            :index="index"
            :animate="animate"
            :eager="index < 3"
          />
        </li>
      </ul>
    </template>
  </MediaListingShell>
</template>
