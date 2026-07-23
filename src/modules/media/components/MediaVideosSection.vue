<script setup lang="ts">
import MediaListingShell from '@modules/media/components/MediaListingShell.vue'
import MediaVideoCard from '@modules/media/components/MediaVideoCard.vue'

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
} = useMediaVideoGalleries()

const showRefreshOverlay = computed(() => isLoading.value && hasItems.value)
</script>

<template>
  <MediaListingShell
    title-id="media-videos-title"
    :title="t('site.media.videos.title')"
    :subtitle="t('site.media.videos.subtitle')"
    :is-loading="isLoading"
    :has-items="hasItems"
    :error-message="errorMessage"
    :error-title="t('site.media.videos.errorTitle')"
    :empty-title="t('site.media.videos.emptyTitle')"
    :empty-description="t('site.media.videos.emptyDescription')"
    empty-icon="lucide:clapperboard"
    :page="page"
    :total-pages="totalPages"
    :show-refresh-overlay="showRefreshOverlay"
    @retry="refresh()"
    @update:page="setPage"
  >
    <template #default="{ animate }">
      <ul role="list" class="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        <li v-for="(gallery, index) in items" :key="gallery.id">
          <MediaVideoCard
            :gallery="gallery"
            :index="index"
            :animate="animate"
            :eager="index < 2"
          />
        </li>
      </ul>
    </template>
  </MediaListingShell>
</template>
