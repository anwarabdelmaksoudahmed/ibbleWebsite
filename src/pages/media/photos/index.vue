<script setup lang="ts">
import MediaPhotosSection from '@modules/media/components/MediaPhotosSection.vue'

definePageMeta({ layout: 'site' })

const { t } = useI18n()

useSeoMeta({
  title: () => t('site.media.photos.seoTitle'),
  description: () => t('site.media.photos.seoDescription'),
})
</script>

<template>
  <MediaPhotosSection />
</template>
