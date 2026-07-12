<script setup lang="ts">
import type { ComponentSize } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'

export type BaseRadioProps = {
  modelValue?: string | number
  value: string | number
  label?: string
  name: string
  size?: ComponentSize
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<BaseRadioProps>(), {
  size: 'md',
  disabled: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()
const inputId = computed(() => props.id ?? useId())
</script>

<template>
  <label :for="inputId" class="inline-flex cursor-pointer items-center gap-2">
    <input
      :id="inputId"
      type="radio"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      :disabled="disabled"
      :class="cn('border-border text-primary-600 focus:ring-primary-500', size === 'sm' ? 'size-3.5' : 'size-4')"
      @change="emit('update:modelValue', value)"
    >
    <span v-if="label" class="text-sm text-foreground">{{ label }}</span>
  </label>
</template>
