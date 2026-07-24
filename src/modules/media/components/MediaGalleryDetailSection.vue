<script setup lang="ts">
import MarketplaceFetchLoader from '@shared/components/site/MarketplaceFetchLoader.vue'
import MediaLazyImage from '@modules/media/components/MediaLazyImage.vue'
import MediaLightbox from '@modules/media/components/MediaLightbox.vue'
import { MEDIA_ROUTES } from '@modules/media/constants/routes'
import type { MediaAsset } from '@modules/media/types'

const props = defineProps<{
  id: string
  kind: 'image' | 'video'
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { gallery, isLoading, errorMessage, refresh } = useMediaGalleryDetail(
  () => props.id,
  () => props.kind,
)

const dateLabel = useMediaDateLabel(
  () => gallery.value?.publishDate || gallery.value?.createdAt,
)

const sectionRoute = computed(() =>
  props.kind === 'video' ? MEDIA_ROUTES.VIDEOS : MEDIA_ROUTES.PHOTOS,
)

const sectionLabel = computed(() =>
  props.kind === 'video'
    ? t('site.media.videos.title')
    : t('site.media.photos.title'),
)

const errorTitle = computed(() =>
  props.kind === 'video'
    ? t('site.media.videos.detailErrorTitle')
    : t('site.media.photos.detailErrorTitle'),
)

const breadcrumbItems = computed(() => {
  const items: { label: string; to?: string }[] = [
    { label: t('site.nav.home'), to: localePath('/') },
    { label: t('site.nav.media'), to: localePath(MEDIA_ROUTES.ROOT) },
    { label: sectionLabel.value, to: localePath(sectionRoute.value) },
  ]

  if (gallery.value?.title) {
    items.push({ label: gallery.value.title })
  }

  return items
})

const assets = computed<MediaAsset[]>(() => {
  const items = gallery.value?.media ?? []
  if (items.length) return items
  if (!gallery.value?.featuredImage) return []
  return [
    {
      id: `featured-${gallery.value.id}`,
      title: gallery.value.title,
      url: gallery.value.featuredImage,
      kind: props.kind === 'video' ? 'video' : 'image',
    },
  ]
})

const primaryVideo = computed(() =>
  assets.value.find((item) => item.kind === 'video') ?? null,
)

const imageAssets = computed(() => assets.value.filter((item) => item.kind !== 'video'))

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}
</script>

<template>
  <section class="relative min-h-[60vh] overflow-hidden bg-[#f4f6f5]">
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.3]"
      aria-hidden="true"
      style="
        background-image: radial-gradient(rgba(45, 83, 61, 0.06) 1px, transparent 1px);
        background-size: 22px 22px;
      "
    />

    <div class="relative mx-auto max-w-6xl px-4 py-[12px] sm:px-6 lg:pb-14">
      <BaseBreadcrumb :items="breadcrumbItems" class="mb-6" />

      <MarketplaceFetchLoader v-if="isLoading && !gallery" />

      <div v-else-if="errorMessage" class="rounded-2xl border border-ibbil-green/10 bg-white">
        <BaseErrorState
          variant="brand"
          :title="errorTitle"
          :message="errorMessage"
          :retryable="true"
          @retry="refresh()"
        />
      </div>

      <div v-else-if="gallery" class="space-y-6">
        <header class="rounded-2xl border border-ibbil-green/10 bg-white p-5 sm:p-7">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground-muted sm:text-sm">
            <span v-if="dateLabel" class="inline-flex items-center gap-1.5">
              <Icon name="lucide:calendar-days" class="size-3.5" aria-hidden="true" />
              {{ dateLabel }}
            </span>
            <span class="inline-flex items-center gap-1.5">
              <Icon name="lucide:eye" class="size-3.5" aria-hidden="true" />
              {{ gallery.viewsCount }}
            </span>
            <span
              v-if="kind === 'image'"
              class="inline-flex items-center gap-1.5"
            >
              <Icon name="lucide:images" class="size-3.5" aria-hidden="true" />
              {{ gallery.mediaCount || assets.length }}
            </span>
          </div>

          <h1 class="mt-3 text-2xl font-extrabold tracking-tight text-ibbil-green sm:text-3xl">
            {{ gallery.title }}
          </h1>

          <p
            v-if="gallery.content"
            class="mt-3 max-w-3xl text-sm leading-relaxed text-foreground-muted sm:text-base"
          >
            {{ gallery.content }}
          </p>
        </header>

        <div
          v-if="kind === 'video' && primaryVideo"
          class="overflow-hidden rounded-2xl border border-ibbil-green/10 bg-black shadow-[0_16px_40px_-24px_rgba(45,83,61,0.45)]"
        >
          <video
            :src="primaryVideo.url"
            controls
            playsinline
            preload="metadata"
            class="aspect-video w-full bg-black object-contain"
            :poster="gallery.featuredImage && !primaryVideo.url.includes(gallery.featuredImage) ? gallery.featuredImage : undefined"
          >
            {{ t('site.media.videos.unsupported') }}
          </video>
        </div>

        <div v-if="imageAssets.length" class="space-y-4">
          <h2
            v-if="kind === 'video'"
            class="text-lg font-extrabold text-ibbil-green"
          >
            {{ t('site.media.photos.relatedTitle') }}
          </h2>

          <ul
            role="list"
            class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
          >
            <li v-for="(asset, index) in imageAssets" :key="asset.id">
              <button
                type="button"
                class="group relative w-full overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white text-start shadow-sm transition hover:-translate-y-0.5 hover:border-ibbil-gold/45 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green focus-visible:ring-offset-2"
                :aria-label="t('site.media.lightbox.openItem', { title: asset.title || gallery.title })"
                @click="openLightbox(index)"
              >
                <MediaLazyImage
                  :src="asset.url"
                  :alt="asset.title || gallery.title"
                  :eager="index < 4"
                  aspect-class="aspect-square"
                />
                <span
                  class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100"
                  aria-hidden="true"
                >
                  <span class="inline-flex size-10 items-center justify-center rounded-full bg-white/95 text-ibbil-green">
                    <Icon name="lucide:maximize-2" class="size-4" />
                  </span>
                </span>
              </button>
            </li>
          </ul>
        </div>

        <div
          v-else-if="kind === 'image' && gallery.featuredImage"
          class="overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white"
        >
          <button
            type="button"
            class="block w-full text-start"
            :aria-label="t('site.media.lightbox.openItem', { title: gallery.title })"
            @click="openLightbox(0)"
          >
            <MediaLazyImage
              :src="gallery.featuredImage"
              :alt="gallery.title"
              eager
              aspect-class="aspect-[16/10]"
              sizes="(max-width: 1152px) 100vw, 1152px"
            />
          </button>
        </div>
      </div>
    </div>

    <MediaLightbox
      v-model:open="lightboxOpen"
      v-model:index="lightboxIndex"
      :items="imageAssets.length ? imageAssets : assets"
      :title="gallery?.title"
    />
  </section>
</template>
