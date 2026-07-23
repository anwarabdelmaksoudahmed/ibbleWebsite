<script setup lang="ts">
import MediaArticleDetailSection from '@modules/media/components/MediaArticleDetailSection.vue'

definePageMeta({ layout: 'site' })

const { t } = useI18n()
const route = useRoute()
const id = computed(() => String(route.params.id || ''))

const { article, isLoading, errorMessage } = useMediaArticleDetail(id, 'events')

useSeoMeta({
  title: () =>
    article.value
      ? t('site.media.events.detailSeoTitle', { title: article.value.title })
      : t('site.media.events.seoTitle'),
  description: () =>
    article.value?.excerpt || t('site.media.events.seoDescription'),
  ogImage: () => article.value?.featuredImage || undefined,
})

watch(
  [isLoading, article, id, errorMessage],
  () => {
    if (!isLoading.value && id.value && !article.value && !errorMessage.value) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Event Not Found',
        fatal: true,
      })
    }
  },
)
</script>

<template>
  <MediaArticleDetailSection :id="id" kind="events" />
</template>
