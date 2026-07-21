<script setup lang="ts">
import CartNavLink from '@modules/cart/components/CartNavLink.vue'
import { ROUTES } from '@shared/constants/routes'
import { SITE_SERVICE_LINKS, SITE_TOP_LINKS } from '@shared/constants/site-nav'
import { pathMatchesPrefix, stripLocalePrefix } from '@shared/utils/locale-path'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { authenticated, user } = useAuth()

const mobileOpen = ref(false)
const searchQuery = ref('')
const searchCategory = ref('all')

const displayName = computed(() => user.value?.name?.trim() ?? '')
const hasDisplayName = computed(() => displayName.value.length > 0)

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

        <SiteSearchBar
          v-model:query="searchQuery"
          v-model:category="searchCategory"
          variant="header"
          @submit="onSearch"
        />

        <div class="ms-auto flex items-center gap-1 sm:gap-2">
          <div class="hidden sm:block">
            <LocaleSwitcher variant="header" />
          </div>

          <NuxtLinkLocale
            v-if="authenticated"
            :to="ROUTES.PROFILE"
            class="header-user-greeting inline-flex min-w-0 max-w-[11rem] items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white sm:max-w-[14rem] md:max-w-[16rem] lg:max-w-[18rem]"
            :aria-label="hasDisplayName ? `${t('auth.welcomeBack')}، ${displayName}` : t('site.profile.breadcrumb')"
          >
            <Icon name="lucide:user" class="h-4 w-4 shrink-0" aria-hidden="true" />
            <span
              v-if="hasDisplayName"
              :key="displayName"
              class="hidden min-w-0 items-baseline gap-1 sm:inline-flex"
            >
              <span class="shrink-0 whitespace-nowrap">{{ t('auth.welcomeBack') }}،</span>
              <span
                class="header-user-name min-w-0 truncate font-semibold text-ibbil-gold"
                :title="displayName"
              >{{ displayName }}</span>
            </span>
          </NuxtLinkLocale>
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
          :to="ROUTES.JOIN"
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
        <div class="border-b border-border p-3 md:hidden">
          <SiteSearchBar
            v-model:query="searchQuery"
            v-model:category="searchCategory"
            variant="mobile"
            @submit="onSearch"
          />
        </div>

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
            :to="ROUTES.JOIN"
            class="mt-2 flex items-center justify-center rounded-lg bg-ibbil-green px-3 py-2.5 text-sm font-semibold text-white"
          >
            {{ t('site.nav.joinMerchant') }}
          </NuxtLinkLocale>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.header-user-greeting {
  animation: header-greeting-in 0.35s ease-out both;
}

.header-user-name {
  animation: header-name-slide 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
  transition: color 0.2s ease;
}

.header-user-greeting:hover .header-user-name {
  color: #e8c078;
}

@keyframes header-greeting-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* LTR: name slides in from the right */
@keyframes header-name-slide {
  from {
    opacity: 0;
    transform: translateX(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* RTL: name slides in from the left (after the greeting) */
:dir(rtl) .header-user-name {
  animation-name: header-name-slide-rtl;
}

@keyframes header-name-slide-rtl {
  from {
    opacity: 0;
    transform: translateX(-0.5rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .header-user-greeting,
  .header-user-name {
    animation: none;
  }
}
</style>
