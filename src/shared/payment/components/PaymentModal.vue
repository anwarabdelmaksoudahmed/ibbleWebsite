<script setup lang="ts">
import { cn } from '@shared/utils/cn'

const {
  isOpen,
  isLoading,
  modalPhase: phase,
  summary,
  result,
  errorMessage,
  canRetry,
  mountActiveWidget,
  cancel,
  close,
  retry,
  destroyActiveWidget,
} = usePayment()

const { t, locale } = useI18n()

const widgetContainerRef = ref<HTMLElement | null>(null)
const isWidgetMounted = ref(false)

const displayCurrency = computed(() => summary.value?.currency ?? 'SAR')

function formatAmount(amount: number) {
  const currency = displayCurrency.value
  const localeCode = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  return new Intl.NumberFormat(localeCode, { style: 'currency', currency }).format(amount)
}

async function mountWidget() {
  if (!widgetContainerRef.value || isWidgetMounted.value || phase.value !== 'widget') return

  isWidgetMounted.value = true
  try {
    await mountActiveWidget(widgetContainerRef.value)
  } catch {
    isWidgetMounted.value = false
  }
}

watch(
  [isOpen, phase, widgetContainerRef],
  async ([open, currentPhase]) => {
    if (!open) {
      isWidgetMounted.value = false
      return
    }

    if (currentPhase === 'widget') {
      await nextTick()
      await mountWidget()
    }
  },
  { immediate: true },
)

watch(isOpen, (open) => {
  if (!open) {
    destroyActiveWidget()
    isWidgetMounted.value = false
  }
})

function handleClose() {
  if (phase.value === 'success') {
    close()
    return
  }

  void cancel()
}

function handleRetry() {
  isWidgetMounted.value = false
  void retry()
}
</script>

<template>
  <BaseModal
    :open="isOpen"
    :title="t('payment.modal.title')"
    size="lg"
    :closable="phase !== 'verifying'"
    @update:open="(value: boolean) => !value && handleClose()"
    @close="handleClose"
  >
    <div class="space-y-5">
      <div
        class="flex items-center gap-3 rounded-xl border border-ibbil-green/15 bg-gradient-to-br from-ibbil-green/[0.06] via-transparent to-ibbil-gold/[0.05] px-4 py-3 dark:border-ibbil-green/25 dark:from-ibbil-green/10"
      >
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-full bg-ibbil-green/10 text-ibbil-green dark:bg-ibbil-green/20"
        >
          <Icon name="lucide:shield-check" class="size-5" aria-hidden="true" />
        </div>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-ibbil-green">
            {{ t('payment.modal.secureTitle') }}
          </p>
          <p class="mt-0.5 text-xs text-foreground-muted">
            {{ t('payment.modal.secureHint') }}
          </p>
        </div>
      </div>

      <section
        v-if="summary"
        class="rounded-xl border border-border bg-surface-muted/40 p-4 dark:bg-surface-muted/20"
        :aria-label="t('payment.modal.summaryTitle')"
      >
        <h3 class="text-sm font-bold text-foreground">
          {{ summary.title ?? t('payment.modal.summaryTitle') }}
        </h3>

        <ul v-if="summary.items?.length" class="mt-3 space-y-2">
          <li
            v-for="(item, index) in summary.items"
            :key="`${item.label}-${index}`"
            class="flex items-center justify-between gap-3 text-sm"
          >
            <span class="text-foreground-muted">{{ item.label }}</span>
            <span class="font-medium text-foreground">{{ formatAmount(item.amount) }}</span>
          </li>
        </ul>

        <dl class="mt-3 space-y-2 border-t border-border pt-3 text-sm">
          <div v-if="summary.subtotal != null" class="flex items-center justify-between gap-3">
            <dt class="text-foreground-muted">{{ t('payment.modal.subtotal') }}</dt>
            <dd class="font-medium text-foreground">{{ formatAmount(summary.subtotal) }}</dd>
          </div>
          <div v-if="summary.shipping != null" class="flex items-center justify-between gap-3">
            <dt class="text-foreground-muted">{{ t('payment.modal.shipping') }}</dt>
            <dd class="font-medium text-foreground">{{ formatAmount(summary.shipping) }}</dd>
          </div>
          <div v-if="summary.tax != null" class="flex items-center justify-between gap-3">
            <dt class="text-foreground-muted">{{ t('payment.modal.tax') }}</dt>
            <dd class="font-medium text-foreground">{{ formatAmount(summary.tax) }}</dd>
          </div>
          <div class="flex items-center justify-between gap-3 pt-1">
            <dt class="text-base font-bold text-ibbil-green">{{ t('payment.modal.total') }}</dt>
            <dd class="text-base font-extrabold text-ibbil-green">{{ formatAmount(summary.total) }}</dd>
          </div>
        </dl>
      </section>

      <div
        :class="cn(
          'relative min-h-[12rem] overflow-hidden rounded-xl border border-border bg-white p-4 dark:bg-surface-elevated',
          phase === 'widget' && 'min-h-[16rem]',
        )"
      >
        <div v-if="phase === 'loading' || isLoading && phase === 'widget'" class="py-10">
          <BaseLoader block show-label :label="t('payment.modal.loadingWidget')" tone="brand" />
        </div>

        <div
          v-show="phase === 'widget'"
          ref="widgetContainerRef"
          class="payment-widget-container w-full"
        />

        <div v-if="phase === 'verifying'" class="py-10">
          <BaseLoader block show-label :label="t('payment.modal.verifying')" tone="brand" />
        </div>

        <div v-if="phase === 'success'" class="py-6 text-center">
          <div
            class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-ibbil-green/10 text-ibbil-green"
          >
            <Icon name="lucide:circle-check" class="size-9" aria-hidden="true" />
          </div>
          <h3 class="text-lg font-bold text-ibbil-green">{{ t('payment.modal.successTitle') }}</h3>
          <p class="mt-2 text-sm text-foreground-muted">
            {{ result?.message ?? t('payment.modal.successHint') }}
          </p>
        </div>

        <BaseErrorState
          v-if="phase === 'failure'"
          :title="t('payment.modal.failureTitle')"
          :message="errorMessage ?? t('payment.modal.failureHint')"
          :retryable="canRetry"
          :retry-label="t('payment.modal.retry')"
          variant="brand"
          @retry="handleRetry"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <BaseButton
          v-if="phase === 'success'"
          variant="primary"
          @click="close()"
        >
          {{ t('payment.modal.done') }}
        </BaseButton>

        <template v-else-if="phase !== 'verifying'">
          <BaseButton
            variant="outline"
            :disabled="isLoading"
            @click="handleClose"
          >
            {{ t('common.cancel') }}
          </BaseButton>

          <BaseButton
            v-if="phase === 'failure' && canRetry"
            variant="primary"
            :loading="isLoading"
            @click="handleRetry"
          >
            {{ t('payment.modal.retry') }}
          </BaseButton>
        </template>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.payment-widget-container :deep(.wpwl-form) {
  margin: 0;
}

.payment-widget-container :deep(.wpwl-group) {
  margin-bottom: 0.75rem;
}

.payment-widget-container :deep(.wpwl-control) {
  border-radius: 0.625rem;
}
</style>
