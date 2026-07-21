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
    class="flex h-full flex-col overflow-hidden rounded-3xl border border-ibbil-green/10 bg-white shadow-[0_24px_50px_-28px_rgba(31,58,43,0.55)] dark:border-ibbil-green/25 dark:bg-surface-elevated"
    :aria-label="t('site.profile.sidebar.label')"
  >
    <div
      class="relative overflow-hidden bg-gradient-to-br from-ibbil-green to-ibbil-green-dark px-5 pb-6 pt-7 text-center"
    >
      <div
        class="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style="
          background-image: radial-gradient(rgba(255, 255, 255, 0.14) 1px, transparent 1px);
          background-size: 16px 16px;
        "
      />
      <div
        class="pointer-events-none absolute -end-10 -top-12 size-36 rounded-full bg-ibbil-gold/20 blur-2xl"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -bottom-14 -start-10 size-32 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />

      <div class="relative">
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
            class="shadow-lg shadow-ibbil-green-dark/40 ring-2 ring-ibbil-gold ring-offset-2 ring-offset-ibbil-green"
          />
        </div>

        <BaseSkeleton v-if="loading" class="mx-auto !bg-white/20" width="70%" height="1.1rem" />
        <h2 v-else class="truncate text-base font-bold text-white">{{ name }}</h2>

        <p
          class="mx-auto mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[0.7rem] text-white/85 ring-1 ring-white/15"
        >
          <Icon name="lucide:clock" class="size-3 shrink-0" aria-hidden="true" />
          <span class="truncate">{{ lastLoginLabel }}</span>
        </p>
      </div>

      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-ibbil-gold to-transparent"
        aria-hidden="true"
      />
    </div>

    <nav class="flex-1 space-y-1 p-3" :aria-label="t('site.profile.nav.label')">
      <NuxtLinkLocale
        v-for="item in navItems"
        :key="item.id"
        :to="item.to"
        class="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground-muted transition-all duration-200 hover:bg-ibbil-green/[0.06] hover:text-ibbil-green dark:hover:bg-ibbil-green/20"
        :class="isActive(item.to)
          && '!bg-gradient-to-l !from-ibbil-green/[0.14] !to-ibbil-green/[0.06] !font-bold !text-ibbil-green shadow-sm shadow-ibbil-green/10 dark:!from-ibbil-green/40 dark:!to-ibbil-green/20 dark:!text-white rtl:!bg-gradient-to-r'"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <span
          v-if="isActive(item.to)"
          class="absolute inset-y-2 start-0 w-1 rounded-full bg-ibbil-gold"
          aria-hidden="true"
        />
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200"
          :class="isActive(item.to)
            ? 'bg-ibbil-green text-white shadow-md shadow-ibbil-green/30'
            : 'bg-ibbil-green/[0.07] text-ibbil-green/70 group-hover:bg-ibbil-green/[0.12] group-hover:text-ibbil-green dark:bg-ibbil-green/25 dark:text-white/70 dark:group-hover:text-white'"
        >
          <Icon :name="item.icon" class="size-[1.15rem]" aria-hidden="true" />
        </span>
        <span class="truncate">{{ t(item.labelKey) }}</span>
        <Icon
          name="lucide:chevron-left"
          class="ms-auto size-4 shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-60 ltr:rotate-180"
          :class="isActive(item.to) && '!opacity-80 text-ibbil-gold'"
          aria-hidden="true"
        />
      </NuxtLinkLocale>
    </nav>

    <div class="border-t border-ibbil-green/10 bg-ibbil-green/[0.03] p-4 dark:border-ibbil-green/20 dark:bg-ibbil-green/10">
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
