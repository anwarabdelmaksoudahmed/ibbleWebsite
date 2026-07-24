<script setup lang="ts">
import MarketplaceFetchLoader from '@shared/components/site/MarketplaceFetchLoader.vue'
import MediaLazyImage from '@modules/media/components/MediaLazyImage.vue'
import { MEDIA_ROUTES } from '@modules/media/constants/routes'

const props = defineProps<{
  id: string
  kind: 'news' | 'events'
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { article, isLoading, errorMessage, refresh } = useMediaArticleDetail(
  () => props.id,
  () => props.kind,
)

const dateLabel = useMediaDateLabel(
  () => article.value?.publishDate || article.value?.createdAt,
)

const sectionRoute = computed(() =>
  props.kind === 'events' ? MEDIA_ROUTES.EVENTS : MEDIA_ROUTES.NEWS,
)

const sectionLabel = computed(() =>
  props.kind === 'events'
    ? t('site.media.events.title')
    : t('site.media.news.title'),
)

const errorTitle = computed(() =>
  props.kind === 'events'
    ? t('site.media.events.detailErrorTitle')
    : t('site.media.news.detailErrorTitle'),
)

const breadcrumbItems = computed(() => {
  const items: { label: string; to?: string }[] = [
    { label: t('site.nav.home'), to: localePath('/') },
    { label: t('site.nav.media'), to: localePath(MEDIA_ROUTES.ROOT) },
    { label: sectionLabel.value, to: localePath(sectionRoute.value) },
  ]

  if (article.value?.title) {
    items.push({ label: article.value.title })
  }

  return items
})
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

    <div class="relative mx-auto max-w-4xl px-4 py-[12px] sm:px-6 lg:pb-14">
      <BaseBreadcrumb :items="breadcrumbItems" class="mb-6" />

      <MarketplaceFetchLoader v-if="isLoading && !article" />

      <div v-else-if="errorMessage" class="rounded-2xl border border-ibbil-green/10 bg-white">
        <BaseErrorState
          variant="brand"
          :title="errorTitle"
          :message="errorMessage"
          :retryable="true"
          @retry="refresh()"
        />
      </div>

      <article
        v-else-if="article"
        class="overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white shadow-[0_16px_40px_-24px_rgba(45,83,61,0.4)]"
      >
        <div v-if="article.featuredImage" class="relative">
          <MediaLazyImage
            :src="article.featuredImage"
            :alt="article.title"
            eager
            aspect-class="aspect-[16/9]"
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>

        <div class="p-5 sm:p-8">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground-muted sm:text-sm">
            <span
              v-if="article.category?.title"
              class="inline-flex rounded-full bg-ibbil-green/[0.08] px-2.5 py-1 text-[11px] font-bold text-ibbil-green"
            >
              {{ article.category.title }}
            </span>
            <span v-if="dateLabel" class="inline-flex items-center gap-1.5">
              <Icon name="lucide:calendar-days" class="size-3.5" aria-hidden="true" />
              {{ dateLabel }}
            </span>
            <span class="inline-flex items-center gap-1.5">
              <Icon name="lucide:eye" class="size-3.5" aria-hidden="true" />
              {{ article.viewsCount }}
            </span>
          </div>

          <h1 class="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-ibbil-green sm:text-3xl">
            {{ article.title }}
          </h1>

          <p
            v-if="article.excerpt && article.excerpt !== article.content"
            class="mt-3 text-base leading-relaxed text-foreground-muted"
          >
            {{ article.excerpt }}
          </p>

          <div
            class="media-prose mt-6 whitespace-pre-line text-[15px] leading-8 text-foreground sm:text-base"
          >
            {{ article.content }}
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
