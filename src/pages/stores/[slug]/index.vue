<script setup lang="ts">
import CategoryStoresSection from '@modules/stores/components/CategoryStoresSection.vue'
import MarketplaceFetchLoader from '@shared/components/site/MarketplaceFetchLoader.vue'
import { STORES_ROUTES } from '@modules/stores/constants/routes'

definePageMeta({ layout: 'site' })

const { t } = useI18n()
const route = useRoute()

const slug = computed(() => String(route.params.slug || ''))

const { isLoading, errorMessage, refresh, findBySlug } = useStoreCategories()

const category = computed(() => findBySlug(slug.value))

const notFound = computed(
  () => !isLoading.value && !errorMessage.value && Boolean(slug.value) && !category.value,
)

await until(isLoading).toBe(false)

if (notFound.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Category Not Found',
    fatal: true,
  })
}

useSeoMeta({
  title: () =>
    category.value
      ? t('site.stores.categorySeoTitle', { name: category.value.name })
      : t('site.stores.seoTitle'),
  description: () =>
    category.value?.description ||
    category.value?.content ||
    t('site.stores.seoDescription'),
})
</script>

<template>
  <div>
    <div
      v-if="isLoading && !category"
      class="flex min-h-[50vh] items-center justify-center bg-[#f4f6f5] px-4"
    >
      <MarketplaceFetchLoader class="max-w-lg" />
      
    </div>
    <div
      v-else-if="errorMessage && !category"
      class="min-h-[50vh] bg-[#f4f6f5] px-4 py-16"
    >
      <div class="mx-auto max-w-lg rounded-2xl border border-ibbil-green/10 bg-white">
        <BaseErrorState
          variant="brand"
          :title="t('site.stores.errorTitle')"
          :message="errorMessage"
          :retryable="true"
          @retry="refresh()"
        >
          <NuxtLinkLocale
            :to="STORES_ROUTES.ROOT"
            class="inline-flex items-center gap-1.5 rounded-lg border border-ibbil-green/20 bg-white px-4 py-2 text-sm font-medium text-ibbil-green transition-colors hover:bg-ibbil-green/[0.06]"
          >
            {{ t('site.stores.backToCategories') }}
          </NuxtLinkLocale>
        </BaseErrorState>
      </div>
    </div>

    <CategoryStoresSection v-else-if="category" :category="category" />
  
  </div>
</template>
