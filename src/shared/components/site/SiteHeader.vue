<script setup lang="ts">
import CartNavLink from '@modules/cart/components/CartNavLink.vue'
import { ROUTES } from '@shared/constants/routes'
import { SITE_SERVICE_LINKS, SITE_TOP_LINKS } from '@shared/constants/site-nav'
import { pathMatchesPrefix, stripLocalePrefix } from '@shared/utils/locale-path'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { authenticated, user, logout } = useAuth()

const mobileOpen = ref(false)
const searchQuery = ref('')
const searchCategory = ref('all')

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  },
)

/** `/services` must not stay active on `/services/*` sibling pages that have their own nav items. */
function isServiceNavActive(to: string) {
  if (to === '/services') {
    return stripLocalePrefix(route.path) === '/services'
  }
  return pathMatchesPrefix(route.path, to)
}

function onSearch() {
  if (!searchQuery.value.trim()) return
  navigateTo({
    path: localePath('/stores'),
    query: { q: searchQuery.value, category: searchCategory.value },
  })
}
</script>

<template>
  <header class="sticky top-0 z-50 shadow-md">
    <div class="bg-ibbil-green text-white">
      <div class="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:gap-6 lg:px-6">
        <SiteLogo light size="sm" class="shrink-0" />

        <nav class="hidden items-center gap-1 xl:flex">
          <NuxtLinkLocale
            v-for="link in SITE_TOP_LINKS"
            :key="link.key"
            :to="link.to"
            class="rounded-md px-2.5 py-1.5 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            active-class="!bg-white/15 !text-white"
          >
            {{ t(link.key) }}
          </NuxtLinkLocale>
        </nav>

        <form
          class="mx-auto hidden min-w-0 flex-1 max-w-xl overflow-hidden rounded-full bg-white shadow-sm md:flex"
          @submit.prevent="onSearch"
        >
          <select
            v-model="searchCategory"
            class="shrink-0 border-e border-border/60 bg-transparent px-3 text-sm text-foreground outline-none"
            :aria-label="t('site.search.category')"
          >
            <option value="all">{{ t('site.search.all') }}</option>
            <option value="stores">{{ t('site.nav.stores') }}</option>
            <option value="services">{{ t('site.nav.services') }}</option>
          </select>
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="t('site.search.placeholder')"
            class="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-foreground-muted"
          >
          <button
            type="submit"
            class="flex items-center justify-center px-4 text-ibbil-green transition-colors hover:bg-ibbil-green/5"
            :aria-label="t('common.search')"
          >
            <Icon name="lucide:search" class="h-4 w-4" />
          </button>
        </form>

        <div class="ms-auto flex items-center gap-1 sm:gap-2">
          <div class="hidden sm:block">
            <LocaleSwitcher variant="header" />
          </div>

          <template v-if="authenticated">
            <NuxtLinkLocale
              :to="ROUTES.PROFILE"
              class="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-white/90 transition-colors hover:bg-white/10"
            >
              <Icon name="lucide:user" class="h-4 w-4" />
              <span class="hidden max-w-[8rem] truncate sm:inline">{{ user?.name || t('auth.welcomeBack') }}</span>
            </NuxtLinkLocale>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-white/90 transition-colors hover:bg-white/10"
              @click="logout"
            >
              <Icon name="lucide:log-out" class="h-4 w-4" />
              <span class="hidden lg:inline">{{ t('auth.logout') }}</span>
            </button>
          </template>
          <NuxtLinkLocale
            v-else
            :to="ROUTES.AUTH.LOGIN"
            class="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-white/90 transition-colors hover:bg-white/10"
          >
            <Icon name="lucide:user" class="h-4 w-4" />
            <span class="hidden sm:inline">{{ t('auth.login') }}</span>
          </NuxtLinkLocale>

          <CartNavLink />

          <button
            type="button"
            class="inline-flex rounded-md p-2 text-white transition-colors hover:bg-white/10 xl:hidden"
            :aria-label="t('site.nav.menu')"
            :aria-expanded="mobileOpen"
            @click="mobileOpen = !mobileOpen"
          >
            <Icon :name="mobileOpen ? 'lucide:x' : 'lucide:menu'" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <div class="bg-ibbil-gold text-ibbil-green-dark">
      <div class="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 lg:px-6">
        <nav class="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex">
          <NuxtLinkLocale
            v-for="link in SITE_SERVICE_LINKS"
            :key="link.key"
            :to="link.to"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-all"
            :class="isServiceNavActive(link.to)
              ? 'bg-ibbil-green text-white shadow-sm'
              : 'text-ibbil-green-dark/90 hover:bg-black/10 hover:text-ibbil-green-dark'"
            :aria-current="isServiceNavActive(link.to) ? 'page' : undefined"
          >
            <Icon
              v-if="link.icon"
              :name="link.icon"
              class="h-4 w-4"
              :class="isServiceNavActive(link.to) ? 'opacity-100' : 'opacity-80'"
            />
            {{ t(link.key) }}
          </NuxtLinkLocale>
        </nav>

        <NuxtLinkLocale
          :to="ROUTES.AUTH.REGISTER"
          class="ms-auto hidden shrink-0 rounded-md bg-ibbil-green px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ibbil-green-dark hover:shadow md:inline-flex"
        >
          {{ t('site.nav.joinMerchant') }}
        </NuxtLinkLocale>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileOpen" class="border-b border-border bg-white xl:hidden">
        <form class="flex gap-2 border-b border-border p-3 md:hidden" @submit.prevent="onSearch">
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="t('site.search.placeholder')"
            class="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-ibbil-green focus:ring-2 focus:ring-ibbil-green/20"
          >
          <button type="submit" class="rounded-lg bg-ibbil-green px-3 text-white">
            <Icon name="lucide:search" class="h-4 w-4" />
          </button>
        </form>

        <div class="flex items-center justify-between border-b border-border px-3 py-2 sm:hidden">
          <LocaleSwitcher variant="mobile" />
        </div>

        <nav class="space-y-1 p-3">
          <NuxtLinkLocale
            v-for="link in SITE_TOP_LINKS"
            :key="`m-${link.key}`"
            :to="link.to"
            class="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-muted"
          >
            {{ t(link.key) }}
          </NuxtLinkLocale>
          <div class="my-2 h-px bg-border" />
          <NuxtLinkLocale
            v-for="link in SITE_SERVICE_LINKS"
            :key="`ms-${link.key}`"
            :to="link.to"
            class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors"
            :class="isServiceNavActive(link.to)
              ? 'bg-ibbil-green/10 font-medium text-ibbil-green'
              : 'text-foreground hover:bg-surface-muted'"
            :aria-current="isServiceNavActive(link.to) ? 'page' : undefined"
          >
            <Icon
              v-if="link.icon"
              :name="link.icon"
              class="h-4 w-4"
              :class="isServiceNavActive(link.to) ? 'text-ibbil-green' : 'text-ibbil-gold'"
            />
            {{ t(link.key) }}
          </NuxtLinkLocale>
          <NuxtLinkLocale
            :to="ROUTES.AUTH.REGISTER"
            class="mt-2 flex items-center justify-center rounded-lg bg-ibbil-green px-3 py-2.5 text-sm font-semibold text-white"
          >
            {{ t('site.nav.joinMerchant') }}
          </NuxtLinkLocale>
        </nav>
      </div>
    </Transition>
  </header>
</template>
