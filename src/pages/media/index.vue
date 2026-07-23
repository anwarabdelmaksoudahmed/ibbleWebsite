<script setup lang="ts">
import MediaHubSection from '@modules/media/components/MediaHubSection.vue'

definePageMeta({ layout: 'site' })

const { t } = useI18n()

useSeoMeta({
  title: () => t('site.media.seoTitle'),
  description: () => t('site.media.seoDescription'),
})
</script>

<template>
  <MediaHubSection />
</template>
