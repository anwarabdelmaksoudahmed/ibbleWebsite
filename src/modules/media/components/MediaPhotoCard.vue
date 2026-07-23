<script setup lang="ts">
import type { MediaGallery } from '@modules/media/types'
import { MEDIA_ROUTES } from '@modules/media/constants/routes'
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
const to = computed(() => MEDIA_ROUTES.PHOTO_DETAIL(props.gallery.id))

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
      <MediaLazyImage
        :src="gallery.featuredImage"
        :alt="gallery.title"
        :eager="eager"
        aspect-class="aspect-[4/3]"
        img-class="group-hover:scale-[1.05]"
      />
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95"
        aria-hidden="true"
      />
      <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-4">
        <div class="min-w-0">
          <h3 class="line-clamp-2 text-sm font-extrabold text-white sm:text-base">
            {{ gallery.title }}
          </h3>
          <p v-if="dateLabel" class="mt-1 text-[11px] text-white/80 sm:text-xs">
            {{ dateLabel }}
          </p>
        </div>
        <span
          class="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-bold text-ibbil-green backdrop-blur-sm"
        >
          <Icon name="lucide:images" class="size-3.5" aria-hidden="true" />
          {{ gallery.mediaCount || 1 }}
        </span>
      </div>
      <span
        class="absolute start-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-ibbil-green opacity-0 shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:opacity-100"
        aria-hidden="true"
      >
        <Icon name="lucide:maximize-2" class="size-4" />
      </span>
    </div>

    <div class="flex items-center justify-between gap-2 px-4 py-3 text-xs text-foreground-muted sm:px-5">
      <span class="inline-flex items-center gap-1">
        <Icon name="lucide:eye" class="size-3.5" aria-hidden="true" />
        {{ gallery.viewsCount }}
      </span>
      <span class="inline-flex items-center gap-1 font-semibold text-ibbil-green">
        {{ t('site.media.viewGallery') }}
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
