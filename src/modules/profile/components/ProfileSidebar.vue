<script setup lang="ts">
import type { ProfileNavItem } from '@modules/profile/types'
import { stripLocalePrefix } from '@shared/utils/locale-path'

defineProps<{
  name: string
  avatar: string | null
  lastLoginLabel: string
  navItems: ProfileNavItem[]
  loading?: boolean
}>()

const emit = defineEmits<{
  logout: []
}>()

const { t } = useI18n()
const route = useRoute()

function isActive(to: string) {
  return stripLocalePrefix(route.path) === to
}
</script>

<template>
  <aside
    class="flex h-full flex-col overflow-hidden rounded-3xl border border-ibbil-green/10 bg-white shadow-[0_16px_40px_-24px_rgba(45,83,61,0.4)] dark:border-ibbil-green/20 dark:bg-surface-elevated"
    :aria-label="t('site.profile.sidebar.label')"
  >
    <div class="border-b border-border px-5 py-6 text-center">
      <div class="mx-auto mb-3 flex justify-center">
        <BaseSkeleton
          v-if="loading"
          width="4.5rem"
          height="4.5rem"
          rounded="full"
        />
        <BaseAvatar
          v-else
          :src="avatar || undefined"
          :name="name"
          size="xl"
          class="ring-2 ring-ibbil-gold/40 ring-offset-2 ring-offset-white dark:ring-offset-surface-elevated"
        />
      </div>

      <BaseSkeleton v-if="loading" class="mx-auto" width="70%" height="1.1rem" />
      <h2 v-else class="truncate text-base font-bold text-foreground">{{ name }}</h2>

      <p class="mt-1.5 text-xs text-foreground-muted">{{ lastLoginLabel }}</p>
    </div>

    <nav class="flex-1 space-y-0.5 p-3" :aria-label="t('site.profile.nav.label')">
      <NuxtLinkLocale
        v-for="item in navItems"
        :key="item.id"
        :to="item.to"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground-muted transition-colors hover:bg-ibbil-green/[0.06] hover:text-ibbil-green"
        :class="isActive(item.to) && '!bg-ibbil-green/[0.1] !font-semibold !text-ibbil-green'"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <Icon :name="item.icon" class="size-5 shrink-0" aria-hidden="true" />
        {{ t(item.labelKey) }}
      </NuxtLinkLocale>
    </nav>

    <div class="border-t border-border p-4">
      <BaseButton
        variant="danger"
        block
        class="!rounded-xl"
        @click="emit('logout')"
      >
        <Icon name="lucide:log-out" class="size-4" aria-hidden="true" />
        {{ t('auth.logout') }}
      </BaseButton>
    </div>
  </aside>
</template>
