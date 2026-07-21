<script setup lang="ts">
import { cn } from '@shared/utils/cn'

export type BaseErrorStateProps = {
  title?: string
  message?: string
  retryable?: boolean
  retryLabel?: string
  variant?: 'default' | 'brand'
}

const props = withDefaults(defineProps<BaseErrorStateProps>(), {
  title: undefined,
  message: undefined,
  retryable: true,
  retryLabel: undefined,
  variant: 'default',
})

const emit = defineEmits<{ retry: [] }>()

const { t } = useI18n()

const resolvedTitle = computed(() => props.title ?? t('errors.generic'))
const resolvedMessage = computed(() => props.message ?? t('common.errorDescription'))
const resolvedRetryLabel = computed(() => props.retryLabel ?? t('common.tryAgain'))
</script>

<template>
  <div
    class="flex flex-col items-center justify-center px-4 py-14 text-center sm:py-16"
    role="alert"
  >
    <div
      :class="cn(
        'mb-4 flex items-center justify-center rounded-full p-4',
        variant === 'brand' ? 'bg-ibbil-gold/15 text-ibbil-gold' : 'bg-danger/10 text-danger',
      )"
    >
      <Icon name="lucide:alert-circle" class="size-8" aria-hidden="true" />
    </div>

    <h3
      :class="cn(
        'text-base font-semibold sm:text-lg',
        variant === 'brand' ? 'text-ibbil-green' : 'text-foreground',
      )"
    >
      {{ resolvedTitle }}
    </h3>

    <p class="mt-2 max-w-md text-sm leading-relaxed text-foreground-muted">
      {{ resolvedMessage }}
    </p>

    <div v-if="retryable || $slots.default" class="mt-5 flex flex-wrap items-center justify-center gap-2">
      <BaseButton
        v-if="retryable"
        :variant="variant === 'brand' ? 'secondary' : 'outline'"
        class="min-w-[8rem]"
        :class="
          variant === 'brand'
            ? '!border-ibbil-green/20 !bg-white !text-ibbil-green hover:!bg-ibbil-green/[0.06]'
            : undefined
        "
        @click="emit('retry')"
      >
        <Icon name="lucide:refresh-cw" class="size-4" aria-hidden="true" />
        {{ resolvedRetryLabel }}
      </BaseButton>
      <slot />
    </div>
  </div>
</template>
