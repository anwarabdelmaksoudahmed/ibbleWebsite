<script setup lang="ts">
import type { StoreProfile } from '@modules/stores/types'

const props = defineProps<{
  store: StoreProfile
}>()

const { t } = useI18n()

type ProfileTab = 'about' | 'policies'

const activeTab = ref<ProfileTab>('about')

const tabs = computed(() => {
  const items: { id: ProfileTab; label: string }[] = []
  if (props.store.about) {
    items.push({ id: 'about', label: t('site.stores.profile.tabs.about') })
  }
  if (props.store.policies) {
    items.push({ id: 'policies', label: t('site.stores.profile.tabs.policies') })
  }
  return items
})

watch(
  tabs,
  (next) => {
    if (!next.some((tab) => tab.id === activeTab.value)) {
      activeTab.value = next[0]?.id ?? 'about'
    }
  },
  { immediate: true },
)

const body = computed(() => {
  if (activeTab.value === 'policies') return props.store.policies
  return props.store.about
})

const hasContent = computed(() => tabs.value.length > 0)
</script>

<template>
  <section
    v-if="hasContent"
    class="rounded-2xl border border-ibbil-green/10 bg-white p-4 shadow-[0_8px_24px_-18px_rgba(45,83,61,0.35)] sm:p-6 dark:border-ibbil-green/20 dark:bg-surface-elevated"
  >
    <div
      role="tablist"
      class="flex gap-1 border-b border-ibbil-green/10 dark:border-ibbil-green/20"
      :aria-label="t('site.stores.profile.tabs.about')"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        :id="`store-tab-${tab.id}`"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`store-panel-${tab.id}`"
        class="relative px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green focus-visible:ring-offset-2"
        :class="
          activeTab === tab.id
            ? 'text-ibbil-green'
            : 'text-foreground-muted hover:text-ibbil-green'
        "
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span
          v-if="activeTab === tab.id"
          class="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ibbil-green"
          aria-hidden="true"
        />
      </button>
    </div>

    <div
      :id="`store-panel-${activeTab}`"
      role="tabpanel"
      :aria-labelledby="`store-tab-${activeTab}`"
      class="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground-muted sm:text-base"
    >
      <h2 class="sr-only">
        {{
          activeTab === 'policies'
            ? t('site.stores.profile.tabs.policies')
            : t('site.stores.profile.tabs.about')
        }}
      </h2>
      <p>{{ body }}</p>
    </div>
  </section>
</template>
