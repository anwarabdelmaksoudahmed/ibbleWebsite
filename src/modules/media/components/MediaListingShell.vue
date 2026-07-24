<script setup lang="ts">
import MarketplaceFetchLoader from '@shared/components/site/MarketplaceFetchLoader.vue'
import { MEDIA_ROUTES } from '@modules/media/constants/routes'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    titleId: string
    isLoading: boolean
    hasItems: boolean
    errorMessage: string | null
    errorTitle: string
    emptyTitle: string
    emptyDescription: string
    emptyIcon?: string
    page: number
    totalPages: number
    showRefreshOverlay?: boolean
  }>(),
  {
    subtitle: '',
    emptyIcon: 'lucide:newspaper',
    showRefreshOverlay: false,
  },
)

const emit = defineEmits<{
  retry: []
  'update:page': [page: number]
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const breadcrumbItems = computed(() => [
  { label: t('site.nav.home'), to: localePath('/') },
  { label: t('site.nav.media'), to: localePath(MEDIA_ROUTES.ROOT) },
  { label: props.title },
])

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    if (entry?.isIntersecting) isVisible.value = true
  },
  { threshold: 0.04, rootMargin: '0px 0px -2% 0px' },
)
</script>

<template>
  <section
    ref="sectionRef"
    class="relative min-h-[60vh] overflow-hidden bg-[#f4f6f5]"
    :aria-labelledby="titleId"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.3]"
      aria-hidden="true"
      style="
        background-image: radial-gradient(rgba(45, 83, 61, 0.06) 1px, transparent 1px);
        background-size: 22px 22px;
      "
    />

    <div class="relative mx-auto max-w-7xl px-4 py-[12px] sm:px-6 lg:px-6 lg:pb-14">
      <BaseBreadcrumb :items="breadcrumbItems" class="mb-6" />

      <header
        class="mb-8"
        :class="isVisible ? 'media-reveal' : 'opacity-0'"
      >
        <h1
          :id="titleId"
          class="text-2xl font-extrabold tracking-tight text-ibbil-green sm:text-3xl"
        >
          {{ title }}
        </h1>

        <p
          v-if="subtitle"
          class="mt-2.5 max-w-2xl text-sm leading-relaxed text-foreground-muted sm:text-base"
        >
          {{ subtitle }}
        </p>

        <div class="relative mt-3 flex h-3 w-28 items-center" aria-hidden="true">
          <span class="h-px w-full bg-ibbil-green/20" />
          <span
            class="absolute start-0 h-1 w-10 origin-start rounded-full bg-ibbil-gold"
            :class="isVisible ? 'media-accent-grow' : 'scale-x-0'"
          />
        </div>
      </header>

      <MarketplaceFetchLoader v-if="isLoading && !hasItems" />

      <div v-else-if="errorMessage" class="rounded-2xl border border-ibbil-green/10 bg-white">
        <BaseErrorState
          variant="brand"
          :title="errorTitle"
          :message="errorMessage"
          :retryable="true"
          @retry="emit('retry')"
        />
      </div>

      <div v-else-if="!hasItems" class="rounded-2xl border border-ibbil-green/10 bg-white">
        <BaseEmptyState
          variant="brand"
          :title="emptyTitle"
          :description="emptyDescription"
          :icon="emptyIcon"
        >
          <BaseButton
            variant="outline"
            class="!border-ibbil-green/20 !text-ibbil-green hover:!bg-ibbil-green/[0.06]"
            @click="emit('retry')"
          >
            <Icon name="lucide:refresh-cw" class="size-4" aria-hidden="true" />
            {{ t('common.tryAgain') }}
          </BaseButton>
        </BaseEmptyState>
      </div>

      <div v-else class="relative">
        <div
          v-if="showRefreshOverlay"
          class="absolute inset-0 z-10 flex items-start justify-center rounded-2xl bg-[#f4f6f5]/70 pt-24 backdrop-blur-[1px]"
          aria-live="polite"
        >
          <BaseLoader block size="lg" tone="brand" show-label class="!py-0" />
        </div>

        <div :class="showRefreshOverlay ? 'pointer-events-none opacity-60' : undefined">
          <slot :animate="isVisible && !showRefreshOverlay" />
        </div>

        <div v-if="totalPages > 1" class="mt-8 flex justify-center">
          <BasePagination
            :page="page"
            :total-pages="totalPages"
            :disabled="isLoading"
            show-page-info
            @update:page="emit('update:page', $event)"
          />
        </div>
      </div>
    </div>
  </section>
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
