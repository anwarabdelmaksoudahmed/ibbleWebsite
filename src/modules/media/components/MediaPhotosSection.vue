<script setup lang="ts">
import MediaListingShell from '@modules/media/components/MediaListingShell.vue'
import MediaPhotoCard from '@modules/media/components/MediaPhotoCard.vue'

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
} = useMediaImageGalleries()

const showRefreshOverlay = computed(() => isLoading.value && hasItems.value)
</script>

<template>
  <MediaListingShell
    title-id="media-photos-title"
    :title="t('site.media.photos.title')"
    :subtitle="t('site.media.photos.subtitle')"
    :is-loading="isLoading"
    :has-items="hasItems"
    :error-message="errorMessage"
    :error-title="t('site.media.photos.errorTitle')"
    :empty-title="t('site.media.photos.emptyTitle')"
    :empty-description="t('site.media.photos.emptyDescription')"
    empty-icon="lucide:images"
    :page="page"
    :total-pages="totalPages"
    :show-refresh-overlay="showRefreshOverlay"
    @retry="refresh()"
    @update:page="setPage"
  >
    <template #default="{ animate }">
      <ul
        role="list"
        class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5"
      >
        <li v-for="(gallery, index) in items" :key="gallery.id">
          <MediaPhotoCard
            :gallery="gallery"
            :index="index"
            :animate="animate"
            :eager="index < 4"
          />
        </li>
      </ul>
    </template>
  </MediaListingShell>
</template>
