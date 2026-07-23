<script setup lang="ts">
import type { VeterinaryReservation } from '@modules/veterinary/types'
import type { ComponentVariant } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'

const props = defineProps<{
  item: VeterinaryReservation
  expanded?: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const { t, te } = useI18n()

const statusVariant = computed<ComponentVariant>(() => {
  switch (props.item.status) {
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'danger'
    case 'active':
      return 'info'
    case 'pending':
    default:
      return 'warning'
  }
})

const statusStripClass = computed(() => {
  switch (props.item.status) {
    case 'completed':
    case 'active':
      return 'bg-ibbil-green'
    case 'cancelled':
      return 'bg-danger'
    case 'pending':
    default:
      return 'bg-ibbil-gold'
  }
})

const statusLabel = computed(() => {
  const key = `site.profile.veterinary.status.${props.item.status}`
  return te(key) ? t(key) : props.item.status
})

const paymentLabel = computed(() =>
  props.item.isPaid
    ? t('site.profile.veterinary.card.paid')
    : t('site.profile.veterinary.card.unpaid'),
)

const paymentVariant = computed<ComponentVariant>(() =>
  props.item.isPaid ? 'success' : 'warning',
)

const attendedLabel = computed(() => {
  if (props.item.attended == null) return t('site.profile.veterinary.card.attendanceUnknown')
  return props.item.attended
    ? t('site.profile.veterinary.card.attended')
    : t('site.profile.veterinary.card.notAttended')
})

const SERVICE_TYPE_I18N: Record<string, string> = {
  clinic_examine: 'site.veterinary.book.serviceTypes.clinic.title',
  clinic: 'site.veterinary.book.serviceTypes.clinic.title',
  outdoor_examine: 'site.veterinary.book.serviceTypes.fieldVisit.title',
  field_visit: 'site.veterinary.book.serviceTypes.fieldVisit.title',
  fieldvisit: 'site.veterinary.book.serviceTypes.fieldVisit.title',
}

const serviceTypeLabel = computed(() => {
  const raw = props.item.serviceType.trim()
  if (!raw) return '—'

  const normalized = raw.toLowerCase().replace(/[\s-]+/g, '_')
  const key = SERVICE_TYPE_I18N[normalized]
  if (key && te(key)) return t(key)

  const profileKey = `site.profile.veterinary.serviceTypes.${normalized}`
  if (te(profileKey)) return t(profileKey)

  return raw
})
</script>

<template>
  <article
    :class="cn(
      'group relative overflow-hidden rounded-2xl border bg-white shadow-[0_10px_28px_-22px_rgba(45,83,61,0.45)] transition-all duration-300 dark:bg-surface-elevated',
      item.status === 'cancelled'
        ? 'border-danger/15 hover:border-danger/30'
        : 'border-ibbil-green/15 hover:border-ibbil-green/35',
    )"
  >
    <div
      class="absolute inset-y-0 end-0 flex w-8 items-center justify-center sm:w-9"
      :class="statusStripClass"
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
            <Icon
              name="lucide:stethoscope"
              class="size-7 text-ibbil-green/50"
              aria-hidden="true"
            />
          </div>

          <div class="min-w-0">
            <p class="truncate text-sm font-bold text-ibbil-green sm:text-base">
              {{ item.clinicName || t('site.profile.veterinary.card.unknownClinic') }}
            </p>
            <p class="mt-0.5 text-xs text-foreground-muted sm:text-sm">
              {{ t('site.profile.veterinary.card.reservationNumber', { id: item.id }) }}
            </p>
            <p v-if="item.createdAt" class="mt-0.5 text-xs text-foreground-muted">
              {{ t('site.profile.veterinary.card.bookedAt', { date: item.createdAt }) }}
            </p>
          </div>
        </div>

        <div class="flex min-w-0 flex-1 flex-col gap-1.5 sm:items-center sm:text-center">
          <p class="truncate text-xs text-foreground-muted sm:text-sm">
            {{ item.doctor.fullName || t('site.profile.veterinary.card.unknownDoctor') }}
          </p>
          <p class="truncate text-sm font-medium text-foreground">
            {{ serviceTypeLabel }}
          </p>
          <p class="text-sm font-semibold text-foreground">
            <span class="font-medium text-foreground-muted">
              {{ t('site.profile.veterinary.card.total') }}:
            </span>
            <MoneyAmount :amount="item.price" class="ms-1" />
          </p>
        </div>

        <div class="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
          <div class="flex flex-wrap items-center gap-2">
            <BaseBadge :variant="statusVariant" size="sm">
              {{ statusLabel }}
            </BaseBadge>
            <BaseBadge :variant="paymentVariant" size="sm">
              {{ paymentLabel }}
            </BaseBadge>
          </div>

          <BaseButton
            variant="ghost"
            size="sm"
            class="!rounded-xl !px-2"
            :aria-expanded="expanded"
            :aria-label="
              expanded
                ? t('site.profile.veterinary.card.collapse')
                : t('site.profile.veterinary.card.expand')
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
              {{ t('site.profile.veterinary.card.visitTitle') }}
            </h4>
            <dl class="space-y-2.5 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.veterinary.card.doctor') }}</dt>
                <dd class="text-end font-medium text-foreground">
                  {{ item.doctor.fullName || '—' }}
                </dd>
              </div>
              <div v-if="item.doctor.subtitle" class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.veterinary.card.specialty') }}</dt>
                <dd class="text-end font-medium text-foreground">{{ item.doctor.subtitle }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.veterinary.card.examineMethod') }}</dt>
                <dd class="text-end font-medium text-foreground">
                  {{ item.doctor.examineMethod || '—' }}
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="shrink-0 text-foreground-muted">{{ t('site.profile.veterinary.card.clinicAddress') }}</dt>
                <dd class="text-end font-medium text-foreground">
                  {{ item.doctor.clinicAddress || '—' }}
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.veterinary.card.appointmentTime') }}</dt>
                <dd class="text-end font-medium text-foreground">
                  {{ item.timeLabel || '—' }}
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.veterinary.card.attendance') }}</dt>
                <dd class="text-end font-medium text-foreground">{{ attendedLabel }}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h4 class="mb-3 text-sm font-bold text-ibbil-green">
              {{ t('site.profile.veterinary.card.detailsTitle') }}
            </h4>
            <dl class="space-y-2.5 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.veterinary.card.serviceType') }}</dt>
                <dd class="text-end font-medium text-foreground">{{ serviceTypeLabel }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.veterinary.card.customer') }}</dt>
                <dd class="text-end font-medium text-foreground">{{ item.customerName || '—' }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.veterinary.card.phone') }}</dt>
                <dd dir="ltr" class="text-end font-medium text-foreground">
                  {{ item.customerPhone || '—' }}
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.veterinary.card.nationalId') }}</dt>
                <dd class="text-end font-medium text-foreground">
                  {{ item.customerNationalId || '—' }}
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.veterinary.card.deposit') }}</dt>
                <dd class="font-medium text-foreground">
                  <MoneyAmount :amount="item.depositAmount" />
                </dd>
              </div>
              <div class="flex justify-between gap-3 border-t border-border pt-2.5">
                <dt class="font-semibold text-ibbil-green">{{ t('site.profile.veterinary.card.total') }}</dt>
                <dd class="font-bold text-ibbil-green">
                  <MoneyAmount :amount="item.price" />
                </dd>
              </div>
              <div v-if="item.diagnosis" class="flex justify-between gap-3 pt-1">
                <dt class="shrink-0 text-foreground-muted">{{ t('site.profile.veterinary.card.diagnosis') }}</dt>
                <dd class="text-end font-medium text-foreground">{{ item.diagnosis }}</dd>
              </div>
              <div v-if="item.prescription" class="flex justify-between gap-3">
                <dt class="shrink-0 text-foreground-muted">{{ t('site.profile.veterinary.card.prescription') }}</dt>
                <dd class="text-end font-medium text-foreground">{{ item.prescription }}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div
          v-if="item.invoiceUrl"
          class="mt-5 flex flex-wrap gap-2 border-t border-border pt-4"
        >
          <a
            :href="item.invoiceUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-xl border border-ibbil-green/20 bg-white px-3 py-2 text-sm font-medium text-ibbil-green transition-colors hover:bg-ibbil-green/[0.06] dark:bg-surface-elevated"
          >
            <Icon name="lucide:file-text" class="size-4" aria-hidden="true" />
            {{ t('site.profile.veterinary.card.invoice') }}
          </a>
        </div>
      </div>
    </div>
  </article>
</template>
