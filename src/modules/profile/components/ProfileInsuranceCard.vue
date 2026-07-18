<script setup lang="ts">
import type { UserInsurance } from '@modules/insurance/types'
import { dayjs } from '@shared/utils/formatters'
import { cn } from '@shared/utils/cn'

const props = defineProps<{
  item: UserInsurance
  expanded?: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const { t } = useI18n()

const isActive = computed(() => props.item.status === 'active')

const statusLabel = computed(() =>
  t(`site.profile.insurance.status.${props.item.status}`),
)

const dateRangeLabel = computed(() => {
  const formatted = dayjs(props.item.date).isValid()
    ? dayjs(props.item.date).format('YYYY-MM-DD')
    : props.item.date
  return t('site.profile.insurance.card.dateRange', { date: formatted })
})

const feeRows = computed(() => [
  {
    key: 'insuredAmount',
    label: t('site.profile.insurance.card.fees.insuredAmount'),
    value: props.item.fees.insuredAmount,
  },
  {
    key: 'certificateFees',
    label: t('site.profile.insurance.card.fees.certificateFees'),
    value: props.item.fees.certificateFees,
  },
  {
    key: 'transportationCoverage',
    label: t('site.profile.insurance.card.fees.transportationCoverage'),
    value: props.item.fees.transportationCoverage,
  },
  {
    key: 'taxFees',
    label: t('site.profile.insurance.card.fees.taxFees'),
    value: props.item.fees.taxFees,
  },
  {
    key: 'total',
    label: t('site.profile.insurance.card.fees.total'),
    value: props.item.fees.total,
    emphasize: true,
  },
])
</script>

<template>
  <article
    :class="cn(
      'group relative overflow-hidden rounded-2xl border bg-white shadow-[0_10px_28px_-22px_rgba(45,83,61,0.45)] transition-all duration-300 dark:bg-surface-elevated',
      isActive
        ? 'border-ibbil-green/15 hover:border-ibbil-green/35'
        : 'border-danger/15 hover:border-danger/30',
    )"
  >
    <div
      class="absolute inset-y-0 end-0 flex w-8 items-center justify-center sm:w-9"
      :class="isActive ? 'bg-ibbil-green' : 'bg-danger'"
      aria-hidden="true"
    >
      <span
        class="origin-center -rotate-180 text-[0.65rem] font-bold tracking-wide text-white [writing-mode:vertical-rl] sm:text-xs"
      >
        {{ statusLabel }}
      </span>
    </div>

    <div class="pe-10 sm:pe-12">
      <div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <div class="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <div
            class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-[#fafbfa] sm:size-16"
          >
            <img
              v-if="item.provider.image"
              :src="item.provider.image"
              :alt="item.provider.name"
              class="size-full object-contain p-1.5"
              loading="lazy"
            >
            <Icon
              v-else
              name="lucide:shield"
              class="size-7 text-ibbil-green/50"
              aria-hidden="true"
            />
          </div>

          <div class="min-w-0">
            <p class="truncate text-sm font-bold text-ibbil-green sm:text-base">
              {{ item.provider.name || t('site.profile.insurance.card.unknownProvider') }}
            </p>
            <p class="mt-0.5 text-xs text-foreground-muted sm:text-sm">
              {{ t('site.profile.insurance.card.policyNumber', { id: item.id }) }}
            </p>
          </div>
        </div>

        <div class="flex min-w-0 flex-1 flex-col gap-1.5 sm:items-center sm:text-center">
          <p class="text-xs text-foreground-muted sm:text-sm">{{ dateRangeLabel }}</p>
          <p class="text-sm font-semibold text-foreground">
            <span class="text-foreground-muted font-medium">
              {{ t('site.profile.insurance.card.totalPrice') }}:
            </span>
            <MoneyAmount :amount="item.totalPrice" class="ms-1" />
          </p>
        </div>

        <div class="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
          <BaseBadge :variant="isActive ? 'success' : 'danger'" size="sm">
            {{ statusLabel }}
          </BaseBadge>

          <BaseButton
            variant="ghost"
            size="sm"
            class="!rounded-xl !px-2"
            :aria-expanded="expanded"
            :aria-label="
              expanded
                ? t('site.profile.insurance.card.collapse')
                : t('site.profile.insurance.card.expand')
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
        <div class="grid gap-5 md:grid-cols-2">
          <section>
            <h4 class="mb-3 text-sm font-bold text-ibbil-green">
              {{ t('site.profile.insurance.card.detailsTitle') }}
            </h4>
            <dl class="space-y-2.5 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.insurance.card.fullName') }}</dt>
                <dd class="font-medium text-foreground">{{ item.fullName || '—' }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.insurance.card.phone') }}</dt>
                <dd dir="ltr" class="text-end font-medium text-foreground">{{ item.phone || '—' }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.insurance.card.email') }}</dt>
                <dd class="truncate font-medium text-foreground">{{ item.email || '—' }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.insurance.card.address') }}</dt>
                <dd class="font-medium text-foreground">{{ item.address || '—' }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.insurance.card.iban') }}</dt>
                <dd dir="ltr" class="text-end font-medium tabular-nums text-foreground">
                  {{ item.iban || '—' }}
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h4 class="mb-3 text-sm font-bold text-ibbil-green">
              {{ t('site.profile.insurance.card.feesTitle') }}
            </h4>
            <dl class="space-y-2.5 text-sm">
              <div
                v-for="row in feeRows"
                :key="row.key"
                class="flex justify-between gap-3"
                :class="row.emphasize && 'border-t border-border pt-2.5'"
              >
                <dt :class="row.emphasize ? 'font-semibold text-ibbil-green' : 'text-foreground-muted'">
                  {{ row.label }}
                </dt>
                <dd
                  :class="row.emphasize ? 'font-bold text-ibbil-green' : 'font-medium text-foreground'"
                >
                  <MoneyAmount :amount="row.value" />
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <div
          v-if="item.invoiceUrl || item.policiesUrl"
          class="mt-5 flex flex-wrap gap-2 border-t border-border pt-4"
        >
          <a
            v-if="item.invoiceUrl"
            :href="item.invoiceUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-xl border border-ibbil-green/20 bg-white px-3 py-2 text-sm font-medium text-ibbil-green transition-colors hover:bg-ibbil-green/[0.06] dark:bg-surface-elevated"
          >
            <Icon name="lucide:file-text" class="size-4" aria-hidden="true" />
            {{ t('site.profile.insurance.card.invoice') }}
          </a>
          <a
            v-if="item.policiesUrl"
            :href="item.policiesUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-xl border border-ibbil-green/20 bg-white px-3 py-2 text-sm font-medium text-ibbil-green transition-colors hover:bg-ibbil-green/[0.06] dark:bg-surface-elevated"
          >
            <Icon name="lucide:shield" class="size-4" aria-hidden="true" />
            {{ t('site.profile.insurance.card.policies') }}
          </a>
        </div>
      </div>
    </div>
  </article>
</template>
