<script setup lang="ts">
import MediaEventsSection from '@modules/media/components/MediaEventsSection.vue'

definePageMeta({ layout: 'site' })

const { t } = useI18n()

useSeoMeta({
  title: () => t('site.media.events.seoTitle'),
  description: () => t('site.media.events.seoDescription'),
})
</script>

<template>
  <MediaEventsSection />
</template>
