<script setup lang="ts">
import type { WalletDetails } from '@modules/checkout/types'
import { cn } from '@shared/utils/cn'

defineProps<{
  wallet: WalletDetails | null
  loading?: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <article
    :class="cn(
      'relative overflow-hidden rounded-2xl border border-ibbil-green/15 bg-white shadow-[0_12px_32px_-22px_rgba(45,83,61,0.45)] dark:bg-surface-elevated',
    )"
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-ibbil-green via-ibbil-gold to-ibbil-green"
      aria-hidden="true"
    />

    <div class="p-5 sm:p-6">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex items-start gap-4">
          <div
            class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-ibbil-green/[0.08] text-ibbil-green sm:size-16"
          >
            <Icon name="lucide:wallet" class="size-7" aria-hidden="true" />
          </div>

          <div class="min-w-0">
            <p class="text-sm font-medium text-foreground-muted">
              {{ t('site.profile.wallet.summary.balanceLabel') }}
            </p>
            <BaseSkeleton v-if="loading" class="mt-2" width="8rem" height="2rem" />
            <p v-else class="mt-1 text-3xl font-extrabold tracking-tight text-ibbil-green sm:text-4xl">
              <MoneyAmount :amount="wallet?.balance ?? 0" />
            </p>
            <p v-if="wallet?.pendingAmount != null && !loading" class="mt-1 text-xs text-foreground-muted">
              {{ t('site.profile.wallet.summary.pendingAmount') }}:
              <MoneyAmount :amount="wallet.pendingAmount" class="ms-1 text-xs" />
            </p>
          </div>
        </div>

        <div
          v-if="wallet?.bankInfo && !loading"
          class="rounded-xl border border-ibbil-green/10 bg-ibbil-green/[0.03] px-4 py-3 text-sm sm:min-w-[14rem]"
        >
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-ibbil-green">
            {{ t('site.profile.wallet.summary.bankInfo') }}
          </p>
          <dl class="space-y-1.5">
            <div v-if="wallet.bankInfo.accountName" class="flex justify-between gap-3">
              <dt class="text-foreground-muted">{{ t('site.profile.wallet.summary.accountName') }}</dt>
              <dd class="font-medium text-foreground">{{ wallet.bankInfo.accountName }}</dd>
            </div>
            <div v-if="wallet.bankInfo.bankName" class="flex justify-between gap-3">
              <dt class="text-foreground-muted">{{ t('site.profile.wallet.summary.bankName') }}</dt>
              <dd class="font-medium text-foreground">{{ wallet.bankInfo.bankName }}</dd>
            </div>
            <!-- <div v-if="wallet.bankInfo.iban" class="flex justify-between gap-3">
              <dt class="text-foreground-muted">{{ t('site.profile.wallet.summary.iban') }}</dt>
              <dd dir="ltr" class="text-end font-medium text-foreground">{{ wallet.bankInfo.iban }}</dd>
            </div> -->
          </dl>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <BaseStatCard
          :label="t('site.profile.wallet.summary.totalDeposit')"
          icon="lucide:arrow-down-left"
          accent="green"
          :loading="loading"
        >
          <template #value>
            <MoneyAmount :amount="wallet?.totalDeposit ?? 0" class="text-xl sm:text-2xl" />
          </template>
        </BaseStatCard>

        <BaseStatCard
          :label="t('site.profile.wallet.summary.totalWithdraw')"
          icon="lucide:arrow-up-right"
          accent="gold"
          :loading="loading"
        >
          <template #value>
            <MoneyAmount :amount="wallet?.totalWithdraw ?? 0" class="text-xl sm:text-2xl" />
          </template>
        </BaseStatCard>

        <BaseStatCard
          :label="t('site.profile.wallet.summary.depositCount')"
          :value="wallet?.depositCount ?? 0"
          icon="lucide:plus-circle"
          accent="green"
          :loading="loading"
        />

        <BaseStatCard
          :label="t('site.profile.wallet.summary.withdrawCount')"
          :value="wallet?.withdrawCount ?? 0"
          icon="lucide:minus-circle"
          accent="neutral"
          :loading="loading"
        />
      </div>
    </div>
  </article>
</template>
