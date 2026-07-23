<script setup lang="ts">
import MediaGalleryDetailSection from '@modules/media/components/MediaGalleryDetailSection.vue'

definePageMeta({ layout: 'site' })

const { t } = useI18n()
const route = useRoute()
const id = computed(() => String(route.params.id || ''))

const { gallery, isLoading, errorMessage } = useMediaGalleryDetail(id, 'video')

useSeoMeta({
  title: () =>
    gallery.value
      ? t('site.media.videos.detailSeoTitle', { title: gallery.value.title })
      : t('site.media.videos.seoTitle'),
  description: () =>
    gallery.value?.content || t('site.media.videos.seoDescription'),
  ogImage: () => gallery.value?.featuredImage || undefined,
})

watch(
  [isLoading, gallery, id, errorMessage],
  () => {
    if (!isLoading.value && id.value && !gallery.value && !errorMessage.value) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Video Not Found',
        fatal: true,
      })
    }
  },
)
</script>

<template>
  <MediaGalleryDetailSection :id="id" kind="video" />
</template>
