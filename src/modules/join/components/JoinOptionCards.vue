<script setup lang="ts">
import { cn } from '@shared/utils/cn'

export type JoinOptionCardItem = {
  value: string
  label: string
  description?: string
  icon?: string
}

const props = defineProps<{
  label: string
  options: JoinOptionCardItem[]
  modelValue: string | null
  error?: string
  required?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const groupId = useId()

const gridClass = computed(() =>
  props.options.length >= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2',
)

function isSelected(value: string) {
  return props.modelValue === value
}
</script>

<template>
  <fieldset
    class="space-y-2.5"
    role="radiogroup"
    :aria-labelledby="`${groupId}-label`"
    :aria-invalid="error ? true : undefined"
    :aria-describedby="error ? `${groupId}-error` : undefined"
  >
    <legend :id="`${groupId}-label`" class="block text-sm font-semibold text-ibbil-green">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </legend>

    <div class="grid gap-3" :class="gridClass">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        role="radio"
        :aria-checked="isSelected(option.value)"
        :class="cn(
          'group flex items-center gap-3 rounded-xl border-2 bg-[#fafbfa] p-3.5 text-start transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green/30 focus-visible:ring-offset-2',
          isSelected(option.value)
            ? 'border-ibbil-green bg-ibbil-green/[0.06] shadow-sm shadow-ibbil-green/10'
            : 'border-border hover:border-ibbil-green/40 hover:bg-white',
        )"
        @click="emit('update:modelValue', option.value)"
      >
        <span
          v-if="option.icon"
          :class="cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors',
            isSelected(option.value)
              ? 'bg-ibbil-green text-white'
              : 'bg-ibbil-green/10 text-ibbil-green group-hover:bg-ibbil-green/15',
          )"
          aria-hidden="true"
        >
          <Icon :name="option.icon" class="size-5" />
        </span>

        <span class="min-w-0 flex-1">
          <span
            :class="cn(
              'block text-sm font-bold transition-colors',
              isSelected(option.value) ? 'text-ibbil-green' : 'text-foreground',
            )"
          >
            {{ option.label }}
          </span>
          <span v-if="option.description" class="mt-0.5 block text-xs leading-snug text-foreground-muted">
            {{ option.description }}
          </span>
        </span>

        <span
          :class="cn(
            'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
            isSelected(option.value)
              ? 'border-ibbil-green bg-ibbil-green'
              : 'border-border bg-white group-hover:border-ibbil-green/45',
          )"
          aria-hidden="true"
        >
          <Icon
            name="lucide:check"
            :class="cn(
              'size-3 stroke-[3.5] text-white transition-all duration-150',
              isSelected(option.value) ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
            )"
          />
        </span>
      </button>
    </div>

    <p v-if="error" :id="`${groupId}-error`" class="text-xs text-danger" role="alert" data-validation-error>
      {{ error }}
    </p>
  </fieldset>
</template>
