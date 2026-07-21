<script setup lang="ts">
import type { StoreProfile } from '@modules/stores/types'

const props = defineProps<{
  store: StoreProfile
}>()

const { t, n } = useI18n()

const locationLabel = computed(() =>
  [props.store.cityName, props.store.countryName].filter(Boolean).join(' · '),
)

const hasReviews = computed(() => props.store.reviewsCount > 0)
</script>

<template>
  <!-- pb reserves space for the half of the logo that hangs below the cover -->
  <header class="w-full pb-14 sm:pb-16 md:pb-[4.75rem] lg:pb-[5.5rem]">
    <div class="relative">
      <!-- Cover only — overflow stays here so the hanging logo is not clipped -->
      <div
        class="relative h-[14rem] overflow-hidden bg-gradient-to-br from-ibbil-green/90 via-ibbil-green to-ibbil-green-dark
               sm:h-[18rem] md:h-[22rem] lg:h-[26rem]"
      >
        <img
          v-if="store.cover"
          :src="store.cover"
          alt=""
          class="absolute inset-0 h-full w-full object-cover object-center"
          loading="eager"
        >
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/15"
          aria-hidden="true"
        />
      </div>

      <!-- Logo + info outside the overflow-hidden cover -->
      <div class="absolute inset-x-0 bottom-0 z-10">
        <div class="mx-auto flex w-full max-w-7xl items-end gap-3 px-4 sm:gap-5 sm:px-6 lg:gap-6 lg:px-6">
          <div
            class="size-[7rem] shrink-0 translate-y-[50px] overflow-hidden rounded-2xl border-[3px] border-white bg-white
                   shadow-[0_16px_40px_-12px_rgba(0,0,0,0.45)]
                   sm:size-[9rem] sm:rounded-[1.25rem]
                   md:size-[10.5rem] md:rounded-3xl
                   lg:size-[12rem]"
          >
            <img
              v-if="store.logo"
              :src="store.logo"
              :alt="store.name"
              class="h-full w-full object-cover"
              width="192"
              height="192"
            >
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-ibbil-green/[0.06]"
              aria-hidden="true"
            >
              <Icon name="lucide:store" class="h-10 w-10 text-ibbil-green/50 sm:h-12 sm:w-12" />
            </div>
          </div>

          <div class="min-w-0 flex-1 pb-4">
   

            <h1 class="line-clamp-2 text-xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-2xl md:text-3xl lg:text-4xl">
              {{ store.name }}
            </h1>

            <ul
              class="mt-2 flex flex-col gap-1.5 text-xs text-white/90 sm:mt-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-1.5 sm:text-sm"
              role="list"
            >
              <li
                v-if="locationLabel"
                class="inline-flex min-w-0 items-center gap-1.5"
              >
                <Icon name="lucide:truck" class="h-3.5 w-3.5 shrink-0 text-ibbil-gold sm:h-4 sm:w-4" aria-hidden="true" />
                <span class="truncate">{{ locationLabel }}</span>
              </li>

              <li
                v-else-if="store.address"
                class="inline-flex min-w-0 items-center gap-1.5"
              >
                <Icon name="lucide:map-pin" class="h-3.5 w-3.5 shrink-0 text-ibbil-gold sm:h-4 sm:w-4" aria-hidden="true" />
                <span class="line-clamp-1">{{ store.address }}</span>
              </li>

              <li
                v-if="hasReviews"
                class="inline-flex items-center gap-1.5"
                :aria-label="`${t('site.stores.profile.stats.reviews')}: ${n(store.reviewsCount)}`"
              >
                <span class="inline-flex items-center gap-0.5" aria-hidden="true">
                  <Icon
                    v-for="i in 5"
                    :key="i"
                    name="lucide:star"
                    class="h-3.5 w-3.5 fill-ibbil-gold text-ibbil-gold sm:h-4 sm:w-4"
                  />
                </span>
                <span>({{ n(store.reviewsCount) }})</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
