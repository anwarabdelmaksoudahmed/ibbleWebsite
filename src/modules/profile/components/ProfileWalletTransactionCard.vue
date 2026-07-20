<script setup lang="ts">
import type { WalletTransaction } from '@modules/checkout/types'
import type { ComponentVariant } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'

const props = defineProps<{
  item: WalletTransaction
  expanded?: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const { t, te } = useI18n()

const isDeposit = computed(() => props.item.type === 'deposit')
const isCardPayment = computed(() => props.item.paymentSource === 'card')

const typeVariant = computed<ComponentVariant>(() =>
  isDeposit.value ? 'success' : 'info',
)

const typeLabel = computed(() => {
  const key = `site.profile.wallet.type.${props.item.type}`
  return te(key) ? t(key) : props.item.type
})

const statusVariant = computed<ComponentVariant>(() => {
  switch (props.item.status) {
    case 'completed':
      return 'success'
    case 'failed':
    case 'cancelled':
      return 'danger'
    case 'pending':
    default:
      return 'warning'
  }
})

const statusLabel = computed(() => {
  const key = `site.profile.wallet.status.${props.item.status}`
  return te(key) ? t(key) : props.item.status
})

const paymentSourceLabel = computed(() =>
  t(`site.profile.wallet.paymentSource.${props.item.paymentSource}`),
)

const paymentSourceVariant = computed<ComponentVariant>(() =>
  isCardPayment.value ? 'warning' : 'success',
)

const paymentMethodLabel = computed(() => {
  const raw = props.item.paymentMethod.trim().toLowerCase()
  if (raw === 'wallet' || raw === 'card') {
    return t(`site.profile.wallet.paymentSource.${raw}`)
  }
  if (props.item.paymentMethod) return props.item.paymentMethod
  return paymentSourceLabel.value
})

const paymentMethodIcon = computed(() =>
  isCardPayment.value ? 'lucide:credit-card' : 'lucide:wallet',
)
</script>

<template>
  <article
    :class="cn(
      'group relative overflow-hidden rounded-2xl border border-ibbil-green/15 bg-white shadow-[0_10px_28px_-22px_rgba(45,83,61,0.45)] transition-all duration-300 hover:border-ibbil-green/35 dark:bg-surface-elevated',
    )"
  >
    <div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
      <div class="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <div
          :class="cn(
            'flex size-14 shrink-0 items-center justify-center rounded-xl border sm:size-16',
            isDeposit
              ? 'border-ibbil-green/20 bg-ibbil-green/[0.06] text-ibbil-green'
              : 'border-ibbil-gold/25 bg-ibbil-gold/10 text-ibbil-gold',
          )"
        >
          <Icon
            :name="isDeposit ? 'lucide:arrow-down-left' : 'lucide:arrow-up-right'"
            class="size-7"
            aria-hidden="true"
          />
        </div>

        <div class="min-w-0">
          <p class="truncate text-sm font-bold text-ibbil-green sm:text-base">
            {{ item.title || t('site.profile.wallet.card.unknownTitle') }}
          </p>
          <p class="mt-0.5 flex min-w-0 items-baseline gap-1 text-xs text-foreground-muted sm:text-sm">
            <span class="shrink-0">{{ t('site.profile.wallet.card.transactionNumberLabel') }}</span>
            <BaseTooltip
              v-if="item.transactionId"
              :text="String(item.transactionId)"
              class="min-w-0 flex-1"
            >
              <span
                class="block min-w-0 truncate font-medium tabular-nums text-foreground/85"
              
                :aria-label="t('site.profile.wallet.card.transactionNumber', { id: item.transactionId })"
              >
                {{ item.transactionId }}
              </span>
            </BaseTooltip>
            <span v-else class="text-foreground/60">—</span>
          </p>
          <p v-if="item.createdAt" class="mt-0.5 text-xs text-foreground-muted">
            {{ t('site.profile.wallet.card.createdAt', { date: item.createdAt }) }}
          </p>
        </div>
      </div>

      <div class="flex min-w-0 flex-1 flex-col gap-1.5 sm:items-center sm:text-center">
        <p class="text-sm font-semibold text-foreground">
          <span class="font-medium text-foreground-muted">
            {{ t('site.profile.wallet.card.amount') }}:
          </span>
          <MoneyAmount :amount="item.amount" class="ms-1" />
        </p>
        <p v-if="item.orderId" class="text-xs text-foreground-muted sm:text-sm">
          {{ t('site.profile.wallet.card.orderId', { id: item.orderId }) }}
        </p>
      </div>

      <div class="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
        <div class="flex flex-wrap items-center gap-2">
          <BaseBadge :variant="paymentSourceVariant" size="sm">
            <Icon :name="paymentMethodIcon" class="size-3.5" aria-hidden="true" />
            {{ paymentSourceLabel }}
          </BaseBadge>
          <BaseBadge :variant="typeVariant" size="sm">
            {{ typeLabel }}
          </BaseBadge>
          <BaseBadge :variant="statusVariant" size="sm">
            {{ statusLabel }}
          </BaseBadge>
        </div>

        <BaseButton
          variant="ghost"
          size="sm"
          class="!rounded-xl !px-2"
          :aria-expanded="expanded"
          :aria-label="
            expanded
              ? t('site.profile.wallet.card.collapse')
              : t('site.profile.wallet.card.expand')
          "
          @click="emit('toggle')"
        >
          <Icon
            name="lucide:chevron-down"
            class="size-5 text-foreground-muted transition-transform duration-300"
            :class="expanded && 'rotate-180'"
            aria-hidden="true"
          />
        </BaseButton>
      </div>
    </div>

    <div
      v-show="expanded"
      class="border-t border-border bg-ibbil-green/[0.02] px-4 py-4 sm:px-5 sm:py-5"
    >
      <h4 class="mb-3 text-sm font-bold text-ibbil-green">
        {{ t('site.profile.wallet.card.detailsTitle') }}
      </h4>
      <dl class="grid gap-2.5 text-sm sm:grid-cols-2">
        <div class="flex justify-between gap-3 sm:flex-col sm:gap-0.5">
          <dt class="text-foreground-muted">{{ t('site.profile.wallet.card.paymentMethod') }}</dt>
          <dd class="inline-flex items-center gap-1.5 font-medium text-foreground">
            <Icon :name="paymentMethodIcon" class="size-4 text-ibbil-green" aria-hidden="true" />
            {{ paymentMethodLabel }}
          </dd>
        </div>
        <div class="flex justify-between gap-3 sm:flex-col sm:gap-0.5">
          <dt class="text-foreground-muted">{{ t('site.profile.wallet.card.referenceId') }}</dt>
          <dd class="font-medium text-foreground">{{ item.transactionId || '—' }}</dd>
        </div>
        <div class="flex justify-between gap-3 sm:flex-col sm:gap-0.5">
          <dt class="text-foreground-muted">{{ t('site.profile.wallet.card.orderId') }}</dt>
          <dd class="font-medium text-foreground">{{ item.orderId || '—' }}</dd>
        </div>
        <div class="flex justify-between gap-3 sm:flex-col sm:gap-0.5">
          <dt class="text-foreground-muted">{{ t('site.profile.wallet.card.type') }}</dt>
          <dd class="font-medium text-foreground">{{ typeLabel }}</dd>
        </div>
        <div class="flex justify-between gap-3 sm:flex-col sm:gap-0.5">
          <dt class="text-foreground-muted">{{ t('site.profile.wallet.card.status') }}</dt>
          <dd class="font-medium text-foreground">{{ statusLabel }}</dd>
        </div>
        <div v-if="item.module" class="flex justify-between gap-3 sm:flex-col sm:gap-0.5">
          <dt class="text-foreground-muted">{{ t('site.profile.wallet.card.module') }}</dt>
          <dd class="font-medium text-foreground">{{ item.module }}</dd>
        </div>
      </dl>
    </div>
  </article>
</template>
