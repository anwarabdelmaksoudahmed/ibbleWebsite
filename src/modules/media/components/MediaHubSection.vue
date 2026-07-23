<script setup lang="ts">
import type { MediaSectionKey } from '@modules/media/constants/routes'
import { MEDIA_ROUTES } from '@modules/media/constants/routes'
import MediaArticleCard from '@modules/media/components/MediaArticleCard.vue'
import MediaPhotoCard from '@modules/media/components/MediaPhotoCard.vue'
import MediaVideoCard from '@modules/media/components/MediaVideoCard.vue'
import MarketplaceFetchLoader from '@shared/components/site/MarketplaceFetchLoader.vue'

const { t } = useI18n()

const sections = computed(() => [
  {
    key: 'news' as const,
    to: MEDIA_ROUTES.NEWS,
    icon: 'lucide:newspaper',
    title: t('site.media.sections.news.title'),
    description: t('site.media.sections.news.description'),
  },
  {
    key: 'photos' as const,
    to: MEDIA_ROUTES.PHOTOS,
    icon: 'lucide:images',
    title: t('site.media.sections.photos.title'),
    description: t('site.media.sections.photos.description'),
  },
  {
    key: 'videos' as const,
    to: MEDIA_ROUTES.VIDEOS,
    icon: 'lucide:clapperboard',
    title: t('site.media.sections.videos.title'),
    description: t('site.media.sections.videos.description'),
  },
  {
    key: 'events' as const,
    to: MEDIA_ROUTES.EVENTS,
    icon: 'lucide:calendar-days',
    title: t('site.media.sections.events.title'),
    description: t('site.media.sections.events.description'),
  },
])

const news = useMediaNews(3)
const photos = useMediaImageGalleries(4)
const videos = useMediaVideoGalleries(3)
const events = useMediaEvents(3)

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    if (entry?.isIntersecting) isVisible.value = true
  },
  { threshold: 0.04 },
)

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

function sectionTitle(key: MediaSectionKey) {
  return t(`site.media.${key}.title`)
}

function viewAllLabel(key: MediaSectionKey) {
  return t('site.media.viewAll', { section: sectionTitle(key) })
}
</script>

<template>
  <div class="bg-[#f4f6f5]">
    <section
      ref="sectionRef"
      class="relative overflow-hidden"
      aria-labelledby="media-hub-title"
    >
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden="true"
        style="
          background-image:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212, 160, 68, 0.18), transparent 55%),
            radial-gradient(rgba(45, 83, 61, 0.06) 1px, transparent 1px);
          background-size: auto, 22px 22px;
        "
      />

      <div class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:py-16">
        <header
          class="mx-auto max-w-2xl text-center"
          :class="isVisible ? 'media-reveal' : 'opacity-0'"
        >
          <p class="text-sm font-bold tracking-wide text-ibbil-gold">
            {{ t('site.media.eyebrow') }}
          </p>
          <h1
            id="media-hub-title"
            class="mt-2 text-3xl font-extrabold tracking-tight text-ibbil-green sm:text-4xl"
          >
            {{ t('site.media.title') }}
          </h1>
          <p class="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-foreground-muted sm:text-base">
            {{ t('site.media.subtitle') }}
          </p>
          <div class="relative mx-auto mt-4 flex h-3 w-28 items-center justify-center" aria-hidden="true">
            <span class="h-px w-full bg-ibbil-green/20" />
            <span
              class="absolute h-1 w-10 origin-center rounded-full bg-ibbil-gold"
              :class="isVisible ? 'media-accent-grow' : 'scale-x-0'"
            />
          </div>
        </header>

        <ul
          role="list"
          class="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
        >
          <li
            v-for="(section, index) in sections"
            :key="section.key"
            :class="isVisible ? 'media-reveal' : 'opacity-0'"
            :style="isVisible ? { animationDelay: `${90 + index * 60}ms` } : undefined"
          >
            <NuxtLinkLocale
              :to="section.to"
              class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white p-5 shadow-[0_10px_28px_-18px_rgba(45,83,61,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-ibbil-gold/45 hover:shadow-[0_22px_44px_-22px_rgba(45,83,61,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green focus-visible:ring-offset-2 sm:p-6"
            >
              <span
                class="pointer-events-none absolute inset-x-0 top-0 h-1 origin-center scale-x-0 bg-ibbil-gold transition-transform duration-300 group-hover:scale-x-100"
                aria-hidden="true"
              />
              <span
                class="inline-flex size-12 items-center justify-center rounded-2xl bg-ibbil-green/[0.08] text-ibbil-green transition-colors duration-300 group-hover:bg-ibbil-green group-hover:text-white"
              >
                <Icon :name="section.icon" class="size-6" aria-hidden="true" />
              </span>
              <h2 class="mt-4 text-lg font-extrabold text-ibbil-green">
                {{ section.title }}
              </h2>
              <p class="mt-1.5 flex-1 text-sm leading-relaxed text-foreground-muted">
                {{ section.description }}
              </p>
              <span
                class="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-ibbil-green transition-colors group-hover:text-ibbil-gold"
              >
                {{ t('site.media.explore') }}
                <DirectionalArrow variant="chevron" size="sm" animated />
              </span>
            </NuxtLinkLocale>
          </li>
        </ul>
      </div>
    </section>

    <section class="relative border-t border-ibbil-green/10 pb-14 pt-4 sm:pb-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6">
        <MarketplaceFetchLoader v-if="previewLoading" min-height="14rem" />

        <div v-else class="space-y-12 sm:space-y-14">
          <div v-if="previews.news.length">
            <div class="mb-5 flex items-end justify-between gap-3">
              <h2 class="text-xl font-extrabold text-ibbil-green sm:text-2xl">
                {{ t('site.media.news.title') }}
              </h2>
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
            <div class="mb-5 flex items-end justify-between gap-3">
              <h2 class="text-xl font-extrabold text-ibbil-green sm:text-2xl">
                {{ t('site.media.photos.title') }}
              </h2>
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
            <div class="mb-5 flex items-end justify-between gap-3">
              <h2 class="text-xl font-extrabold text-ibbil-green sm:text-2xl">
                {{ t('site.media.videos.title') }}
              </h2>
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
            <div class="mb-5 flex items-end justify-between gap-3">
              <h2 class="text-xl font-extrabold text-ibbil-green sm:text-2xl">
                {{ t('site.media.events.title') }}
              </h2>
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
      </div>
    </section>
  </div>
</template>

<style scoped>
.media-reveal {
  animation: media-fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.media-accent-grow {
  animation: media-accent 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
}

@keyframes media-fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes media-accent {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .media-reveal,
  .media-accent-grow {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
