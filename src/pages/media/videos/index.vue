<script setup lang="ts">
import MediaVideosSection from '@modules/media/components/MediaVideosSection.vue'

definePageMeta({ layout: 'site' })

const { t } = useI18n()

useSeoMeta({
  title: () => t('site.media.videos.seoTitle'),
  description: () => t('site.media.videos.seoDescription'),
})
</script>

<template>
  <MediaVideosSection />
</template>
