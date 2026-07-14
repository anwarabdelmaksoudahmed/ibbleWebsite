<script setup lang="ts">
import StoreProfileSection from '@modules/stores/components/StoreProfileSection.vue'
import StoreProfileSkeleton from '@modules/stores/components/StoreProfileSkeleton.vue'
import { STORES_ROUTES } from '@modules/stores/constants/routes'

definePageMeta({ layout: 'site' })

const { t } = useI18n()
const route = useRoute()

const storeSlug = computed(() => {
  const raw = route.params.storeSlug
  const value = Array.isArray(raw) ? raw[0] : raw
  return value ? decodeURIComponent(String(value)) : ''
})

const categorySlug = computed(() => {
  const raw = route.params.slug
  const value = Array.isArray(raw) ? raw[0] : raw
  return value ? decodeURIComponent(String(value)) : ''
})

const {
  store,
  isLoading,
  errorMessage,
  isNotFound,
  refresh,
} = useStoreProfile(storeSlug)

await until(isLoading).toBe(false)

if (isNotFound.value || (!store.value && !errorMessage.value && storeSlug.value)) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Store Not Found',
    fatal: true,
  })
}

const categoryBackPath = computed(() => {
  const slug = store.value?.categorySlug || categorySlug.value
  return slug ? STORES_ROUTES.CATEGORY(slug) : STORES_ROUTES.ROOT
})

useSeoMeta({
  title: () =>
    store.value
      ? t('site.stores.profile.seoTitle', { name: store.value.name })
      : t('site.stores.seoTitle'),
  description: () =>
    store.value?.about ||
    store.value?.description ||
    t('site.stores.profile.seoDescription'),
  ogTitle: () =>
    store.value
      ? t('site.stores.profile.seoTitle', { name: store.value.name })
      : t('site.stores.seoTitle'),
  ogDescription: () =>
    store.value?.about ||
    store.value?.description ||
    t('site.stores.profile.seoDescription'),
  ogImage: () => store.value?.cover || store.value?.logo || undefined,
})

useHead(() => {
  if (!store.value) return {}

  return {
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Store',
          name: store.value.name,
          description: store.value.about || store.value.description,
          image: store.value.cover || store.value.logo || undefined,
          address: {
            '@type': 'PostalAddress',
            streetAddress: store.value.address || undefined,
            addressLocality: store.value.cityName || undefined,
            addressCountry: store.value.countryName || undefined,
          },
        }),
      },
    ],
  }
})
</script>

<template>
  <div>
    <div
      v-if="isLoading && !store"
      class="min-h-[60vh] bg-[#f4f6f5] px-4 py-10 dark:bg-surface-muted sm:px-6 sm:py-12"
    >
      <div class="mx-auto max-w-7xl">
        <StoreProfileSkeleton />
      </div>
    </div>

    <div
      v-else-if="errorMessage && !store"
      class="min-h-[50vh] bg-[#f4f6f5] px-4 py-16 dark:bg-surface-muted"
    >
      <div class="mx-auto max-w-lg rounded-2xl border border-ibbil-green/10 bg-white dark:border-ibbil-green/20 dark:bg-surface-elevated">
        <BaseErrorState
          variant="brand"
          :title="t('site.stores.profile.errorTitle')"
          :message="errorMessage"
          :retryable="true"
          @retry="refresh()"
        >
          <NuxtLinkLocale
            :to="categoryBackPath"
            class="inline-flex items-center gap-1.5 rounded-lg border border-ibbil-green/20 bg-white px-4 py-2 text-sm font-medium text-ibbil-green transition-colors hover:bg-ibbil-green/[0.06] dark:bg-surface-elevated"
          >
            {{ t('site.stores.profile.backToCategory') }}
          </NuxtLinkLocale>
        </BaseErrorState>
      </div>
    </div>

    <StoreProfileSection v-else-if="store" :store="store" />
  </div>
</template>
