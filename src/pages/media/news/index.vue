<script setup lang="ts">
import MediaNewsSection from '@modules/media/components/MediaNewsSection.vue'

definePageMeta({ layout: 'site' })

const { t } = useI18n()

useSeoMeta({
  title: () => t('site.media.news.seoTitle'),
  description: () => t('site.media.news.seoDescription'),
})
</script>

<template>
  <MediaNewsSection />
</template>
