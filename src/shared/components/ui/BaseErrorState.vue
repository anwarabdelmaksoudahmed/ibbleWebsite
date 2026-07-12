<script setup lang="ts">
export type BaseErrorStateProps = {
  title?: string
  message?: string
  retryable?: boolean
}

const props = withDefaults(defineProps<BaseErrorStateProps>(), {
  title: 'Something went wrong',
  message: 'An unexpected error occurred. Please try again.',
  retryable: true,
})

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center" role="alert">
    <div class="mb-4 rounded-full bg-danger/10 p-4">
      <Icon name="lucide:alert-circle" class="size-8 text-danger" />
    </div>
    <h3 class="text-base font-medium text-foreground">{{ title }}</h3>
    <p class="mt-1 max-w-sm text-sm text-foreground-muted">{{ message }}</p>
    <BaseButton v-if="retryable" variant="outline" class="mt-4" @click="emit('retry')">
      Try Again
    </BaseButton>
  </div>
</template>
