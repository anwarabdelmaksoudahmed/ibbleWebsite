<script setup lang="ts">
import { MEDIA_ROUTES } from '@modules/media/constants/routes'
import MediaArticleCard from '@modules/media/components/MediaArticleCard.vue'
import MediaPhotoCard from '@modules/media/components/MediaPhotoCard.vue'
import MediaVideoCard from '@modules/media/components/MediaVideoCard.vue'
import MarketplaceFetchLoader from '@shared/components/site/MarketplaceFetchLoader.vue'
import type { MediaSectionKey } from '@modules/media/constants/routes'

const { t } = useI18n()

const news = useMediaNews(3)
const photos = useMediaImageGalleries(4)
const videos = useMediaVideoGalleries(3)
const events = useMediaEvents(3)

const previews = computed(() => ({
  news: news.items.value.slice(0, 3),
  photos: photos.items.value.slice(0, 4),
  videos: videos.items.value.slice(0, 3),
  events: events.items.value.slice(0, 3),
}))

const previewLoading = computed(
  () =>
    (news.isLoading.value && !news.hasItems.value) ||
    (photos.isLoading.value && !photos.hasItems.value) ||
    (videos.isLoading.value && !videos.hasItems.value) ||
    (events.isLoading.value && !events.hasItems.value),
)

const hasAnyPreview = computed(
  () =>
    previews.value.news.length > 0 ||
    previews.value.photos.length > 0 ||
    previews.value.videos.length > 0 ||
    previews.value.events.length > 0,
)

function sectionTitle(key: MediaSectionKey) {
  return t(`site.media.${key}.title`)
}

function viewAllLabel(key: MediaSectionKey) {
  return t('site.media.viewAll', { section: sectionTitle(key) })
}
</script>

<template>
  <section
    class="rounded-3xl bg-[#f4f6f5]/80 p-4 ring-1 ring-ibbil-green/10 sm:p-6 lg:p-8"
    aria-labelledby="media-latest-title"
  >
    <header class="mb-6 max-w-2xl sm:mb-8">
      <p class="text-xs font-semibold tracking-[0.18em] text-ibbil-gold uppercase sm:text-sm">
        {{ t('site.media.latestEyebrow') }}
      </p>
      <h2
        id="media-latest-title"
        class="mt-2 text-2xl font-extrabold tracking-tight text-ibbil-green sm:text-3xl"
      >
        {{ t('site.media.latestTitle') }}
      </h2>
      <p class="mt-2 text-sm leading-relaxed text-foreground-muted sm:text-base">
        {{ t('site.media.latestSubtitle') }}
      </p>
    </header>

    <MarketplaceFetchLoader v-if="previewLoading" min-height="14rem" />

    <div
      v-else-if="!hasAnyPreview"
      class="rounded-2xl border border-ibbil-green/10 bg-white"
    >
      <BaseEmptyState
        variant="brand"
        :title="t('site.media.latestEmptyTitle')"
        :description="t('site.media.latestEmptyDescription')"
        icon="lucide:newspaper"
      />
    </div>

    <div v-else class="space-y-10 sm:space-y-12">
      <div v-if="previews.news.length">
        <div class="mb-4 flex items-end justify-between gap-3 sm:mb-5">
          <h3 class="text-lg font-extrabold text-ibbil-green sm:text-xl">
            {{ t('site.media.news.title') }}
          </h3>
          <NuxtLinkLocale
            :to="MEDIA_ROUTES.NEWS"
            class="inline-flex items-center gap-1 text-sm font-bold text-ibbil-green hover:text-ibbil-gold"
          >
            {{ viewAllLabel('news') }}
            <DirectionalArrow variant="chevron" size="sm" animated />
          </NuxtLinkLocale>
        </div>
        <ul role="list" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="(article, index) in previews.news" :key="article.id">
            <MediaArticleCard
              :article="article"
              kind="news"
              :index="index"
              animate
              :eager="index === 0"
            />
          </li>
        </ul>
      </div>

      <div v-if="previews.photos.length">
        <div class="mb-4 flex items-end justify-between gap-3 sm:mb-5">
          <h3 class="text-lg font-extrabold text-ibbil-green sm:text-xl">
            {{ t('site.media.photos.title') }}
          </h3>
          <NuxtLinkLocale
            :to="MEDIA_ROUTES.PHOTOS"
            class="inline-flex items-center gap-1 text-sm font-bold text-ibbil-green hover:text-ibbil-gold"
          >
            {{ viewAllLabel('photos') }}
            <DirectionalArrow variant="chevron" size="sm" animated />
          </NuxtLinkLocale>
        </div>
        <ul role="list" class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <li v-for="(gallery, index) in previews.photos" :key="gallery.id">
            <MediaPhotoCard
              :gallery="gallery"
              :index="index"
              animate
              :eager="index < 2"
            />
          </li>
        </ul>
      </div>

      <div v-if="previews.videos.length">
        <div class="mb-4 flex items-end justify-between gap-3 sm:mb-5">
          <h3 class="text-lg font-extrabold text-ibbil-green sm:text-xl">
            {{ t('site.media.videos.title') }}
          </h3>
          <NuxtLinkLocale
            :to="MEDIA_ROUTES.VIDEOS"
            class="inline-flex items-center gap-1 text-sm font-bold text-ibbil-green hover:text-ibbil-gold"
          >
            {{ viewAllLabel('videos') }}
            <DirectionalArrow variant="chevron" size="sm" animated />
          </NuxtLinkLocale>
        </div>
        <ul role="list" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="(gallery, index) in previews.videos" :key="gallery.id">
            <MediaVideoCard
              :gallery="gallery"
              :index="index"
              animate
              :eager="index === 0"
            />
          </li>
        </ul>
      </div>

      <div v-if="previews.events.length">
        <div class="mb-4 flex items-end justify-between gap-3 sm:mb-5">
          <h3 class="text-lg font-extrabold text-ibbil-green sm:text-xl">
            {{ t('site.media.events.title') }}
          </h3>
          <NuxtLinkLocale
            :to="MEDIA_ROUTES.EVENTS"
            class="inline-flex items-center gap-1 text-sm font-bold text-ibbil-green hover:text-ibbil-gold"
          >
            {{ viewAllLabel('events') }}
            <DirectionalArrow variant="chevron" size="sm" animated />
          </NuxtLinkLocale>
        </div>
        <ul role="list" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="(article, index) in previews.events" :key="article.id">
            <MediaArticleCard
              :article="article"
              kind="events"
              :index="index"
              animate
            />
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
