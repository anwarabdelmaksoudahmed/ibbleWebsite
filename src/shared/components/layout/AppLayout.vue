<script setup lang="ts">
import { ROUTES } from '@shared/constants/routes'

const { t } = useI18n()
const colorMode = useColorMode()

const navItems = [
  { label: 'nav.products', to: ROUTES.PRODUCTS.LIST, icon: 'lucide:package' },
  { label: 'nav.orders', to: ROUTES.ORDERS.LIST, icon: 'lucide:shopping-cart' },
  { label: 'nav.customers', to: ROUTES.CUSTOMERS.LIST, icon: 'lucide:users' },
  { label: 'nav.settings', to: ROUTES.SETTINGS.ROOT, icon: 'lucide:settings' },
]

const { logout } = useAuth()
</script>

<template>
  <div class="flex min-h-screen bg-surface">
    <aside class="hidden w-64 shrink-0 border-r border-border bg-surface-elevated lg:block">
      <div class="flex h-16 items-center border-b border-border px-6">
        <NuxtLinkLocale :to="ROUTES.HOME" class="text-lg font-bold text-primary-600">
          Ibble
        </NuxtLinkLocale>
      </div>
      <nav class="space-y-1 p-4">
        <NuxtLinkLocale
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground [&.router-link-active]:bg-primary-50 [&.router-link-active]:text-primary-700 dark:[&.router-link-active]:bg-primary-950 dark:[&.router-link-active]:text-primary-300"
        >
          <Icon :name="item.icon" class="size-5" />
          {{ t(item.label) }}
        </NuxtLinkLocale>
      </nav>
    </aside>

    <div class="flex flex-1 flex-col">
      <header class="flex h-16 items-center justify-between border-b border-border bg-surface-elevated px-6">
        <div class="lg:hidden">
          <NuxtLinkLocale :to="ROUTES.HOME" class="text-lg font-bold text-primary-600">Ibble</NuxtLinkLocale>
        </div>
        <div class="flex items-center gap-3">
          <BaseButton
            variant="ghost"
            size="sm"
            :aria-label="colorMode.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
          >
            <Icon :name="colorMode.value === 'dark' ? 'lucide:sun' : 'lucide:moon'" class="size-5" />
          </BaseButton>
          <BaseButton variant="ghost" size="sm" @click="logout">
            {{ t('auth.logout') }}
          </BaseButton>
        </div>
      </header>
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
