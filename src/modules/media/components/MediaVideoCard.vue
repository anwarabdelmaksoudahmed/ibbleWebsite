<script setup lang="ts">
import type { MediaGallery } from '@modules/media/types'
import { MEDIA_ROUTES } from '@modules/media/constants/routes'
import MediaVideoThumb from '@modules/media/components/MediaVideoThumb.vue'
import MediaLazyImage from '@modules/media/components/MediaLazyImage.vue'

const props = withDefaults(
  defineProps<{
    gallery: MediaGallery
    index?: number
    animate?: boolean
    eager?: boolean
  }>(),
  {
    index: undefined,
    animate: false,
    eager: false,
  },
)

const { t } = useI18n()
const dateLabel = useMediaDateLabel(() => props.gallery.publishDate || props.gallery.createdAt)
const to = computed(() => MEDIA_ROUTES.VIDEO_DETAIL(props.gallery.id))

const isVideoSrc = computed(() =>
  /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(props.gallery.featuredImage),
)

const animationStyle = computed(() =>
  props.animate && props.index != null
    ? { animationDelay: `${70 + props.index * 40}ms` }
    : undefined,
)
</script>

<template>
  <NuxtLinkLocale
    :to="to"
    class="media-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white shadow-[0_10px_30px_-18px_rgba(45,83,61,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-ibbil-gold/45 hover:shadow-[0_22px_44px_-22px_rgba(45,83,61,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green focus-visible:ring-offset-2"
    :class="animate ? 'media-card-enter' : undefined"
    :style="animationStyle"
  >
    <div class="relative overflow-hidden">
      <MediaVideoThumb
        v-if="isVideoSrc"
        :src="gallery.featuredImage"
        :alt="gallery.title"
        :eager="eager"
      />
      <MediaLazyImage
        v-else
        :src="gallery.featuredImage"
        :alt="gallery.title"
        :eager="eager"
        aspect-class="aspect-video"
      />
    </div>

    <div class="flex flex-1 flex-col gap-2 p-4 sm:p-5">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground-muted">
        <span v-if="dateLabel" class="inline-flex items-center gap-1">
          <Icon name="lucide:calendar-days" class="size-3.5" aria-hidden="true" />
          {{ dateLabel }}
        </span>
        <span class="inline-flex items-center gap-1">
          <Icon name="lucide:eye" class="size-3.5" aria-hidden="true" />
          {{ gallery.viewsCount }}
        </span>
      </div>

      <h3
        class="line-clamp-2 text-base font-extrabold leading-snug tracking-tight text-ibbil-green transition-colors group-hover:text-ibbil-green-dark sm:text-lg"
      >
        {{ gallery.title }}
      </h3>

      <p
        v-if="gallery.content"
        class="line-clamp-2 text-sm leading-relaxed text-foreground-muted"
      >
        {{ gallery.content }}
      </p>

      <span
        class="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-bold text-ibbil-green transition-colors group-hover:text-ibbil-gold"
      >
        {{ t('site.media.watchVideo') }}
        <DirectionalArrow variant="chevron" size="sm" animated />
      </span>
    </div>
  </NuxtLinkLocale>
</template>

<style scoped>
.media-card-enter {
  animation: media-fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes media-fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .media-card-enter {
    animation: none;
  }
}
</style>
