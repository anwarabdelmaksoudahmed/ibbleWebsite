<script setup lang="ts">
import { formatFileSize, validateFileSize, validateFileType } from '@shared/utils/file'

export type BaseFileUploadProps = {
  modelValue?: File | File[] | null
  label?: string
  hint?: string
  error?: string
  accept?: string
  multiple?: boolean
  maxSizeMB?: number
  allowedTypes?: string[]
  disabled?: boolean
}

const props = withDefaults(defineProps<BaseFileUploadProps>(), {
  multiple: false,
  maxSizeMB: 10,
  disabled: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: File | File[] | null]; error: [message: string] }>()

const inputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const localError = ref('')

function validate(file: File): boolean {
  if (props.allowedTypes && !validateFileType(file, props.allowedTypes)) {
    localError.value = 'File type not allowed'
    emit('error', localError.value)
    return false
  }
  if (!validateFileSize(file, props.maxSizeMB)) {
    localError.value = `File size must be less than ${props.maxSizeMB}MB`
    emit('error', localError.value)
    return false
  }
  localError.value = ''
  return true
}

function handleFiles(files: FileList | null) {
  if (!files?.length) return

  if (props.multiple) {
    const valid = Array.from(files).filter(validate)
    emit('update:modelValue', valid)
  } else {
    const file = files[0]
    if (file && validate(file)) emit('update:modelValue', file)
  }
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  if (props.disabled) return
  handleFiles(event.dataTransfer?.files ?? null)
}
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" class="block text-sm font-medium text-foreground">{{ label }}</label>
    <div
      :class="[
        'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
        isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-border hover:border-primary-400',
        disabled && 'cursor-not-allowed opacity-50',
        (error || localError) && 'border-danger',
      ]"
      role="button"
      tabindex="0"
      @click="!disabled && inputRef?.click()"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
      @keydown.enter="!disabled && inputRef?.click()"
    >
      <Icon name="lucide:upload-cloud" class="mb-2 size-8 text-foreground-muted" />
      <p class="text-sm text-foreground-muted">Drop files here or click to upload</p>
      <p v-if="hint" class="mt-1 text-xs text-foreground-muted">{{ hint }}</p>
      <input
        ref="inputRef"
        type="file"
        class="hidden"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        @change="handleFiles(($event.target as HTMLInputElement).files)"
      >
    </div>
    <div v-if="modelValue && !Array.isArray(modelValue)" class="text-sm text-foreground-muted">
      {{ modelValue.name }} ({{ formatFileSize(modelValue.size) }})
    </div>
    <p v-if="error || localError" class="text-xs text-danger" role="alert">{{ error || localError }}</p>
  </div>
</template>
