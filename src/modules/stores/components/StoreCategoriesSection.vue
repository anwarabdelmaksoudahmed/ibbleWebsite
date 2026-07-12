<script setup lang="ts">
import StoreCategoryCard from '@modules/stores/components/StoreCategoryCard.vue'

const { t } = useI18n()
const { categories, pending, errorMessage, refresh } = useStoreCategories()

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    if (entry?.isIntersecting) isVisible.value = true
  },
  { threshold: 0.06, rootMargin: '0px 0px -2% 0px' },
)

const skeletonCount = 6
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
        class="mx-auto mb-10 max-w-2xl text-center sm:mb-12"
        :class="isVisible ? 'stores-reveal' : 'opacity-0'"
      >
        <p class="mb-3 text-xs font-semibold tracking-[0.22em] text-ibbil-gold uppercase sm:text-sm">
          {{ t('site.stores.eyebrow') }}
        </p>
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
        <p
          class="mt-4 text-sm leading-relaxed text-foreground-muted sm:text-base"
          :class="isVisible ? 'stores-reveal' : 'opacity-0'"
          :style="isVisible ? { animationDelay: '100ms' } : undefined"
        >
          {{ t('site.stores.subtitle') }}
        </p>
      </header>

      <div
        v-if="pending"
        class="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5"
        aria-busy="true"
      >
        <div
          v-for="i in skeletonCount"
          :key="i"
          class="flex flex-col items-center rounded-2xl border border-ibbil-green/10 bg-white p-6 sm:p-7"
        >
          <BaseSkeleton width="8.5rem" height="8.5rem" rounded="lg" class="mb-5" />
          <BaseSkeleton width="60%" height="1.25rem" />
        </div>
      </div>

      <div v-else-if="errorMessage" class="py-10">
        <BaseErrorState
          :title="t('site.stores.errorTitle')"
          :message="errorMessage"
          :retryable="true"
          @retry="refresh()"
        />
      </div>

      <BaseEmptyState
        v-else-if="!categories?.length"
        :title="t('site.stores.emptyTitle')"
        :description="t('site.stores.emptyDescription')"
        icon="lucide:store"
      />

      <ul
        v-else
        class="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5"
        role="list"
      >
        <li
          v-for="(category, index) in categories"
          :key="category.id"
          :class="isVisible ? undefined : 'opacity-0'"
        >
          <StoreCategoryCard :category="category" :index="index" :animate="isVisible" />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.stores-reveal {
  animation: stores-fade-up 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.stores-accent-grow {
  animation: stores-scale-x 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
}

:deep(.stores-card) {
  animation: stores-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

:deep(.stores-icon) {
  animation: stores-icon-in 0.5s cubic-bezier(0.34, 1.4, 0.64, 1) both;
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

@keyframes stores-icon-in {
  from {
    opacity: 0;
    transform: scale(0.78);
  }
  to {
    opacity: 1;
    transform: scale(1);
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
  .stores-accent-grow,
  :deep(.stores-card),
  :deep(.stores-icon) {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
