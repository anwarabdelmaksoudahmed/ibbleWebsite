<script setup lang="ts">
export type Tab = { id: string; label: string; disabled?: boolean }

export type BaseTabsProps = {
  tabs: Tab[]
  modelValue?: string
  variant?: 'underline' | 'pills'
}

const props = withDefaults(defineProps<BaseTabsProps>(), {
  variant: 'underline',
})

const emit = defineEmits<{ 'update:modelValue': [id: string] }>()

const activeTab = computed({
  get: () => props.modelValue ?? props.tabs[0]?.id,
  set: (id: string) => emit('update:modelValue', id),
})
</script>

<template>
  <div>
    <div
      role="tablist"
      :class="variant === 'pills' ? 'flex gap-2' : 'flex border-b border-border'"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        role="tab"
        type="button"
        :aria-selected="activeTab === tab.id"
        :disabled="tab.disabled"
        :class="[
          'px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50',
          variant === 'pills'
            ? activeTab === tab.id
              ? 'rounded-lg bg-primary-600 text-white'
              : 'rounded-lg text-foreground-muted hover:bg-surface-muted'
            : activeTab === tab.id
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-foreground-muted hover:text-foreground',
        ]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="mt-4">
      <slot :active-tab="activeTab" />
    </div>
  </div>
</template>
