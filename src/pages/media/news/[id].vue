<script setup lang="ts">
import MediaArticleDetailSection from '@modules/media/components/MediaArticleDetailSection.vue'

definePageMeta({ layout: 'site' })

const { t } = useI18n()
const route = useRoute()
const id = computed(() => String(route.params.id || ''))

const { article, isLoading, errorMessage } = useMediaArticleDetail(id, 'news')

useSeoMeta({
  title: () =>
    article.value
      ? t('site.media.news.detailSeoTitle', { title: article.value.title })
      : t('site.media.news.seoTitle'),
  description: () =>
    article.value?.excerpt || t('site.media.news.seoDescription'),
  ogImage: () => article.value?.featuredImage || undefined,
})

watch(
  [isLoading, article, id, errorMessage],
  () => {
    if (!isLoading.value && id.value && !article.value && !errorMessage.value) {
      throw createError({
        statusCode: 404,
        statusMessage: 'News Not Found',
        fatal: true,
      })
    }
  },
)
</script>

<template>
  <MediaArticleDetailSection :id="id" kind="news" />
</template>
