<script setup lang="ts">
import { ROUTES } from '@shared/constants/routes'
import { PROFILE_ROUTES } from '@modules/profile/constants/routes'
import { stripLocalePrefix } from '@shared/utils/locale-path'
import type { ProfileBreadcrumbItem } from '@modules/profile/types'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const {
  user,
  authenticated,
  logout,
  lastLoginLabel,
  sidebarNav,
  isLoading,
  isError,
  refetch,
} = useProfile()

const isUserPending = computed(() => authenticated.value && !user.value)
const displayName = computed(() => {
  const name = user.value?.name?.trim()
  if (name) return name
  // Avoid flashing the guest label while the session is authenticated but identity is still hydrating.
  if (isUserPending.value) return ''
  return t('site.profile.guestName')
})

const currentProfilePath = computed(() => stripLocalePrefix(route.path))

const isInsurance = computed(() => currentProfilePath.value === PROFILE_ROUTES.INSURANCE)
const isMarketplace = computed(() => currentProfilePath.value === PROFILE_ROUTES.MARKETPLACE)
const isVeterinary = computed(() => currentProfilePath.value === PROFILE_ROUTES.VETERINARY)
const isFavourite = computed(() => currentProfilePath.value === PROFILE_ROUTES.FAVOURITE)

const breadcrumbItems = computed<ProfileBreadcrumbItem[]>(() => {
  const items: ProfileBreadcrumbItem[] = [
    { label: t('site.nav.home'), to: localePath(ROUTES.HOME) },
  ]

  if (isInsurance.value) {
    items.push(
      { label: t('site.profile.breadcrumb'), to: localePath(PROFILE_ROUTES.ROOT) },
      { label: t('site.profile.insurance.breadcrumb') },
    )
  } else if (isMarketplace.value) {
    items.push(
      { label: t('site.profile.breadcrumb'), to: localePath(PROFILE_ROUTES.ROOT) },
      { label: t('site.profile.marketplace.breadcrumb') },
    )
  } else if (isVeterinary.value) {
    items.push(
      { label: t('site.profile.breadcrumb'), to: localePath(PROFILE_ROUTES.ROOT) },
      { label: t('site.profile.veterinary.breadcrumb') },
    )
  } else if (isFavourite.value) {
    items.push(
      { label: t('site.profile.breadcrumb'), to: localePath(PROFILE_ROUTES.ROOT) },
      { label: t('site.profile.favorites.breadcrumb') },
    )
  } else {
    items.push({ label: t('site.profile.breadcrumb') })
  }

  return items
})

async function onLogout() {
  await logout()
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[#f4f6f5] dark:bg-surface [scrollbar-gutter:stable]">
    <SiteHeader />

    <main class="relative flex-1">
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
        aria-hidden="true"
        style="
          background-image: radial-gradient(rgba(45, 83, 61, 0.07) 1px, transparent 1px);
          background-size: 22px 22px;
        "
      />

      <div class="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-6 lg:py-10">
        <BaseErrorState
          v-if="isError && !user"
          variant="brand"
          :title="t('site.profile.errorTitle')"
          :message="t('site.profile.errorDescription')"
          @retry="refetch"
        />

        <template v-else>
          <nav class="mb-5" :aria-label="t('common.breadcrumb')">
            <BaseBreadcrumb :items="breadcrumbItems" />
          </nav>

          <div class="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)] lg:gap-7">
            <aside class="order-1 lg:sticky lg:top-24 lg:self-start">
              <ProfileSidebar
                :name="displayName"
                :avatar="user?.avatar ?? null"
                :last-login-label="lastLoginLabel"
                :nav-items="sidebarNav"
                :loading="isUserPending || (isLoading && !user)"
                @logout="onLogout"
              />
            </aside>

            <div class="order-2 min-w-0 space-y-6 sm:space-y-7">
              <slot />
            </div>
          </div>
        </template>
      </div>
    </main>

    <SiteFooter />
  </div>
</template>
