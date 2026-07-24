<script setup lang="ts">
import { TRANSPORT_ROUTES } from '@modules/transport/constants/routes'
import { useTransportRequestStatus } from '@modules/transport/composables/useTransportRequestStatus'
import { PROFILE_ROUTES } from '@modules/profile/constants/routes'
import { ROUTES } from '@shared/constants/routes'
import { formatMoneyAmount } from '@shared/utils/format-money'

const props = defineProps<{
  requestId: string
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

const {
  request,
  pendingOffer,
  offerModalOpen,
  pushPermission,
  isResponding,
  respondingStatus,
  acceptPendingOffer,
  rejectPendingOffer,
  dismissOfferModal,
  enableNotifications,
} = useTransportRequestStatus(() => props.requestId)

const breadcrumbItems = computed(() => [
  { label: t('site.nav.home'), to: localePath(ROUTES.HOME) },
  { label: t('site.nav.transport'), to: localePath(TRANSPORT_ROUTES.ROOT) },
  { label: t('site.transport.request.breadcrumb') },
])

const offerPriceLabel = computed(() => {
  const raw = pendingOffer.value?.price
  if (raw == null || raw === '') return null
  const amount = Number(raw)
  if (!Number.isFinite(amount)) return String(raw)
  return formatMoneyAmount(amount, locale.value)
})

function formatMoney(value: number): string {
  if (!value) return '—'
  return formatMoneyAmount(value, locale.value)
}

function formatDateTime(value: string): string {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-SA' : 'en-SA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}
</script>

<template>
  <section class="bg-[#f4f6f5] dark:bg-background">
    <div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-6">
      <div class="mb-6">
        <BaseBreadcrumb :items="breadcrumbItems" />
      </div>

      <div class="space-y-5">
        <div class="rounded-2xl border border-ibbil-green/10 bg-white p-5 dark:bg-surface-elevated sm:p-6">
          <div class="flex items-start gap-3">
            <span class="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-ibbil-green/10 text-ibbil-green">
              <Icon name="lucide:bell-ring" class="size-5" aria-hidden="true" />
            </span>
            <div class="min-w-0 flex-1">
              <h1 class="text-lg font-bold text-ibbil-green sm:text-xl">
                {{ t('site.transport.request.title') }}
              </h1>
              <p class="mt-1 text-sm text-foreground-muted">
                {{ t('site.transport.request.subtitle') }}
              </p>
              <p
                class="mt-3 inline-flex items-center gap-2 rounded-full bg-ibbil-green/8 px-3 py-1 text-xs font-semibold text-ibbil-green"
              >
                <span
                  class="size-1.5 rounded-full bg-ibbil-green"
                  :class="isResponding ? 'animate-ping' : 'animate-pulse'"
                />
                {{
                  isResponding
                    ? t('site.transport.request.acceptingOffer')
                    : pendingOffer
                      ? t('site.transport.request.offerPendingDecision')
                      : t('site.transport.request.waitingPush')
                }}
              </p>
            </div>
          </div>

          <dl
            v-if="request"
            class="mt-5 grid gap-3 border-t border-ibbil-green/10 pt-5 sm:grid-cols-2"
          >
            <div>
              <dt class="text-xs font-semibold text-foreground-muted">
                {{ t('site.transport.register.form.origin') }}
              </dt>
              <dd class="mt-1 text-sm font-medium text-ibbil-green">
                {{ request.startAddress || '—' }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-semibold text-foreground-muted">
                {{ t('site.transport.register.form.destination') }}
              </dt>
              <dd class="mt-1 text-sm font-medium text-ibbil-green">
                {{ request.endAddress || '—' }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-semibold text-foreground-muted">
                {{ t('site.transport.register.form.transportDate') }}
              </dt>
              <dd class="mt-1 text-sm font-medium text-ibbil-green">
                {{ formatDateTime(request.dateTime) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-semibold text-foreground-muted">
                {{ t('site.transport.request.estimatedPrice') }}
              </dt>
              <dd class="mt-1 text-sm font-medium text-ibbil-green">
                {{ formatMoney(request.price) }}
              </dd>
            </div>
          </dl>

          <div
            v-if="pushPermission !== 'granted'"
            class="mt-5 rounded-xl border border-ibbil-gold/30 bg-ibbil-gold/10 px-4 py-3 text-sm text-foreground"
          >
            <p class="font-medium text-ibbil-green">
              {{ t('site.transport.request.enableNotificationsTitle') }}
            </p>
            <p class="mt-1 text-foreground-muted">
              {{ t('site.transport.request.enableNotificationsHint') }}
            </p>
            <BaseButton
              class="mt-3 !bg-ibbil-green !text-white hover:!bg-ibbil-green-dark"
              size="sm"
              @click="enableNotifications()"
            >
              {{ t('site.transport.request.enableNotifications') }}
            </BaseButton>
          </div>
        </div>

        <div class="rounded-2xl border border-ibbil-green/10 bg-white p-5 dark:bg-surface-elevated sm:p-6">
          <BaseEmptyState
            variant="brand"
            icon="lucide:bell"
            class="!py-10"
            :title="
              pendingOffer
                ? t('site.transport.request.offerPendingTitle')
                : t('site.transport.request.waitingTitle')
            "
            :description="
              pendingOffer
                ? t('site.transport.request.offerPendingHint')
                : t('site.transport.request.waitingDescription')
            "
          />

          <div v-if="pendingOffer && !offerModalOpen" class="mt-4 flex justify-center">
            <BaseButton
              class="!bg-ibbil-green !text-white hover:!bg-ibbil-green-dark"
              @click="offerModalOpen = true"
            >
              {{ t('site.transport.request.reviewOffer') }}
            </BaseButton>
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <BaseButton
            variant="outline"
            class="!border-ibbil-green/20 !text-ibbil-green"
            :to="localePath(PROFILE_ROUTES.TRANSPORTATION)"
          >
            {{ t('site.transport.request.goToTrips') }}
          </BaseButton>
          <BaseButton
            variant="ghost"
            class="!text-foreground-muted"
            :to="localePath(TRANSPORT_ROUTES.ROOT)"
          >
            {{ t('site.transport.request.backHome') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <BaseModal
      v-model:open="offerModalOpen"
      :title="t('site.transport.request.offerModalTitle')"
      size="md"
      :closable="!isResponding"
      @close="dismissOfferModal"
    >
      <div class="space-y-4">
        <p class="text-sm text-foreground-muted">
          {{ t('site.transport.request.offerModalHint') }}
        </p>

        <dl class="grid gap-3 rounded-2xl border border-ibbil-green/10 bg-[#fafbfa] p-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-semibold text-foreground-muted">
              {{ t('site.transport.request.driverOffer') }}
            </dt>
            <dd class="mt-1 text-sm font-bold text-ibbil-green" dir="ltr">
              #{{ pendingOffer?.offerId || '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-foreground-muted">
              {{ t('site.transport.request.offerPrice') }}
            </dt>
            <dd class="mt-1 inline-flex items-center gap-1 text-sm font-bold text-ibbil-green">
              <template v-if="offerPriceLabel">
                <span dir="ltr">{{ offerPriceLabel }}</span>
                <SaudiRiyalSymbol />
              </template>
              <template v-else>
                {{ formatMoney(request?.price ?? 0) }}
              </template>
            </dd>
          </div>
        </dl>

        <div class="flex flex-wrap justify-end gap-2 pt-1">
          <BaseButton
            type="button"
            variant="outline"
            class="!border-red-200 !text-red-700 hover:!bg-red-50"
            :disabled="isResponding"
            :loading="respondingStatus === 'rejected'"
            @click="rejectPendingOffer"
          >
            {{ t('site.transport.request.rejectOffer') }}
          </BaseButton>
          <BaseButton
            type="button"
            class="!bg-ibbil-green !text-white hover:!bg-ibbil-green-dark"
            :disabled="isResponding"
            :loading="respondingStatus === 'accepted'"
            @click="acceptPendingOffer"
          >
            {{ t('site.transport.request.acceptOffer') }}
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </section>
</template>
