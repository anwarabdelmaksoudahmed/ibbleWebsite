<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'settings.view',
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-foreground">{{ t('nav.settings') }}</h1>
    <BaseTabs
      :tabs="[
        { id: 'profile', label: 'Profile' },
        { id: 'preferences', label: 'Preferences' },
        { id: 'security', label: 'Security' },
      ]"
    >
      <template #default="{ activeTab }">
        <BaseCard v-if="activeTab === 'profile'" title="Profile Settings">
          <p class="text-sm text-foreground-muted">Manage your profile information.</p>
        </BaseCard>
        <BaseCard v-else-if="activeTab === 'preferences'" title="Preferences">
          <p class="text-sm text-foreground-muted">Customize your application preferences.</p>
        </BaseCard>
        <BaseCard v-else title="Security">
          <p class="text-sm text-foreground-muted">Manage password and security settings.</p>
        </BaseCard>
      </template>
    </BaseTabs>
  </div>
</template>
