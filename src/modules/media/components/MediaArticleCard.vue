<script setup lang="ts">
import type { MediaArticle } from '@modules/media/types'
import { MEDIA_ROUTES } from '@modules/media/constants/routes'
import MediaLazyImage from '@modules/media/components/MediaLazyImage.vue'

const props = withDefaults(
  defineProps<{
    article: MediaArticle
    kind?: 'news' | 'events'
    index?: number
    animate?: boolean
    eager?: boolean
  }>(),
  {
    kind: 'news',
    index: undefined,
    animate: false,
    eager: false,
  },
)

const { t } = useI18n()
const dateLabel = useMediaDateLabel(() => props.article.publishDate || props.article.createdAt)

const to = computed(() =>
  props.kind === 'events'
    ? MEDIA_ROUTES.EVENT_DETAIL(props.article.id)
    : MEDIA_ROUTES.NEWS_DETAIL(props.article.id),
)

const animationStyle = computed(() =>
  props.animate && props.index != null
    ? { animationDelay: `${80 + props.index * 45}ms` }
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
    <span
      class="pointer-events-none absolute inset-x-0 top-0 z-[2] h-1 origin-center scale-x-0 rounded-b-full bg-ibbil-gold transition-transform duration-300 group-hover:scale-x-100"
      aria-hidden="true"
    />

    <div class="relative overflow-hidden">
      <MediaLazyImage
        :src="article.featuredImage"
        :alt="article.title"
        :eager="eager"
        aspect-class="aspect-[16/10]"
        img-class="group-hover:scale-[1.04]"
      />
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent"
        aria-hidden="true"
      />
      <span
        v-if="article.category?.title"
        class="absolute start-3 top-3 inline-flex max-w-[70%] truncate rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-bold text-ibbil-green shadow-sm backdrop-blur-sm"
      >
        {{ article.category.title }}
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-2 p-4 sm:p-5">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground-muted">
        <span v-if="dateLabel" class="inline-flex items-center gap-1">
          <Icon name="lucide:calendar-days" class="size-3.5" aria-hidden="true" />
          {{ dateLabel }}
        </span>
        <span class="inline-flex items-center gap-1">
          <Icon name="lucide:eye" class="size-3.5" aria-hidden="true" />
          {{ article.viewsCount }}
        </span>
      </div>

      <h3
        class="line-clamp-2 text-base font-extrabold leading-snug tracking-tight text-ibbil-green transition-colors group-hover:text-ibbil-green-dark sm:text-lg"
      >
        {{ article.title }}
      </h3>

      <p
        v-if="article.excerpt"
        class="line-clamp-2 text-sm leading-relaxed text-foreground-muted"
      >
        {{ article.excerpt }}
      </p>

      <span
        class="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-bold text-ibbil-green transition-colors group-hover:text-ibbil-gold"
      >
        {{ t('site.media.readMore') }}
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

  .media-card,
  .media-card * {
    transition: none !important;
  }
}
</style>
