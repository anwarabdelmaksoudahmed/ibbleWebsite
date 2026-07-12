<script setup lang="ts">
import type { CrudMode } from '@shared/types/crud'

const props = withDefaults(
  defineProps<{
    open: boolean
    mode: CrudMode
    createTitle?: string
    editTitle?: string
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    submitting?: boolean
    submitLabel?: string
  }>(),
  {
    createTitle: undefined,
    editTitle: undefined,
    size: 'md',
    submitting: false,
    submitLabel: undefined,
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  close: []
  submit: []
}>()

const { t } = useI18n()

const title = computed(() => {
  if (props.mode === 'edit') return props.editTitle ?? t('crud.editTitle')
  return props.createTitle ?? t('crud.createTitle')
})

const resolvedSubmitLabel = computed(() => {
  if (props.submitLabel) return props.submitLabel
  return props.mode === 'edit' ? t('common.save') : t('common.create')
})

function close() {
  emit('update:open', false)
  emit('close')
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="title"
    :size="size"
    @close="close"
    @update:open="emit('update:open', $event)"
  >
    <form class="space-y-4" @submit.prevent="emit('submit')">
      <slot />

      <div class="flex justify-end gap-3 pt-2">
        <BaseButton type="button" variant="ghost" :disabled="submitting" @click="close">
          {{ t('common.cancel') }}
        </BaseButton>
        <BaseButton type="submit" :loading="submitting">
          {{ resolvedSubmitLabel }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
