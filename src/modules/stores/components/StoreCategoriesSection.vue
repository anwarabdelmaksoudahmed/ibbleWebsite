<script setup lang="ts">
import StoreCategoryCard from '@modules/stores/components/StoreCategoryCard.vue'
import StoresToolbar from '@modules/stores/components/StoresToolbar.vue'
import MarketplaceFetchLoader from '@shared/components/site/MarketplaceFetchLoader.vue'
import type { MarketplaceCardVariant } from '@shared/types/marketplace-card'

const { t } = useI18n()
const { categories, isLoading, errorMessage, refresh } = useStoreCategories()

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const view = ref<MarketplaceCardVariant>('grid')

useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    if (entry?.isIntersecting) isVisible.value = true
  },
  { threshold: 0.06, rootMargin: '0px 0px -2% 0px' },
)

const hasCategories = computed(() => Boolean(categories.value?.length))
const showFetchLoader = computed(() => isLoading.value && !hasCategories.value)
const showRefreshOverlay = computed(() => isLoading.value && hasCategories.value)
</script>

<template>
  <section
    ref="sectionRef"
    class="relative min-h-[60vh] overflow-hidden bg-[#f4f6f5]"
    aria-labelledby="stores-categories-title"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.3]"
      aria-hidden="true"
      style="
        background-image: radial-gradient(rgba(45, 83, 61, 0.06) 1px, transparent 1px);
        background-size: 22px 22px;
      "
    />

    <div class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-6 lg:py-16">
      <header
        class="mx-auto mb-8 max-w-2xl text-center sm:mb-10"
        :class="isVisible ? 'stores-reveal' : 'opacity-0'"
      >

        <h1
          id="stores-categories-title"
          class="text-2xl font-extrabold tracking-tight text-ibbil-green sm:text-3xl"
        >
          {{ t('site.stores.title') }}
        </h1>
        <div class="relative mx-auto mt-3 flex h-3 w-28 items-center justify-center" aria-hidden="true">
          <span class="h-px w-full bg-ibbil-green/20" />
          <span
            class="absolute h-1 w-10 origin-center rounded-full bg-ibbil-gold"
            :class="isVisible ? 'stores-accent-grow' : 'scale-x-0'"
          />
        </div>
   
      </header>


      <MarketplaceFetchLoader v-if="showFetchLoader" />

      <div v-else-if="errorMessage" class="rounded-2xl border border-ibbil-green/10 bg-white">
        <BaseErrorState
          variant="brand"
          :title="t('site.stores.errorTitle')"
          :message="errorMessage"
          :retryable="true"
          @retry="refresh()"
        />
      </div>

      <div
        v-else-if="!hasCategories"
        class="rounded-2xl border border-ibbil-green/10 bg-white"
      >
        <BaseEmptyState
          variant="brand"
          :title="t('site.stores.emptyTitle')"
          :description="t('site.stores.emptyDescription')"
          icon="lucide:store"
        >
          <BaseButton
            variant="outline"
            class="!border-ibbil-green/20 !text-ibbil-green hover:!bg-ibbil-green/[0.06]"
            @click="refresh()"
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

        <ul
          role="list"
          :class="[
            view === 'grid'
              ? 'grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5'
              : 'flex flex-col gap-3 sm:gap-4',
            showRefreshOverlay ? 'pointer-events-none opacity-60' : undefined,
          ]"
        >
          <li
            v-for="(category, index) in categories"
            :key="category.id"
            :class="isVisible ? undefined : 'opacity-0'"
          >
            <StoreCategoryCard
              :category="category"
              :variant="view"
              :index="index"
              :animate="isVisible && !showRefreshOverlay"
            />
          </li>
        </ul>
      </div>    </div>
  </section>
</template>

<style scoped>
.stores-reveal {
  animation: stores-fade-up 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.stores-accent-grow {
  animation: stores-scale-x 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
}

@keyframes stores-fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes stores-scale-x {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stores-reveal,
  .stores-accent-grow {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
