<script setup lang="ts">
import MediaPageSection from '@modules/media/components/MediaPageSection.vue'

definePageMeta({ layout: 'site' })

const { t } = useI18n()

useSeoMeta({
  title: () => t('site.media.seoTitle'),
  description: () => t('site.media.seoDescription'),
})
</script>

<template>
  <MediaPageSection />
</template>
