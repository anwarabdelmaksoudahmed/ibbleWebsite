<script setup lang="ts">
import type { TransportTrip } from '@modules/transport/types'
import type { ComponentVariant } from '@shared/types/ui'
import { dayjs } from '@shared/utils/formatters'
import { cn } from '@shared/utils/cn'

const props = defineProps<{
  item: TransportTrip
  expanded?: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const { t, te, n } = useI18n()

const STATUS_UI: Record<string, { variant: ComponentVariant; strip: string }> = {
  completed: { variant: 'success', strip: 'bg-ibbil-green' },
  cancelled: { variant: 'danger', strip: 'bg-danger' },
  ongoing: { variant: 'info', strip: 'bg-ibbil-green' },
  upcoming: { variant: 'warning', strip: 'bg-ibbil-gold' },
}

const statusUi = computed(
  () => STATUS_UI[props.item.status] ?? STATUS_UI.upcoming!,
)

const statusLabel = computed(() => {
  const key = `site.profile.transportation.status.${props.item.status}`
  return te(key) ? t(key) : props.item.status
})

const dateLabel = computed(() => {
  if (!props.item.dateTime) return ''
  const parsed = dayjs(props.item.dateTime)
  return parsed.isValid() ? parsed.format('YYYY/M/D') : props.item.dateTime
})

const distanceLabel = computed(() => {
  if (props.item.distanceKm == null) return null
  return t('site.profile.transportation.card.distanceValue', {
    value: n(props.item.distanceKm, { maximumFractionDigits: 1 }),
  })
})

const driverPhone = computed(() => {
  const phone = props.item.driver.phone
  if (!phone) return ''
  const code = props.item.driver.countryCode.replace(/\s+/g, '')
  if (!code) return phone
  const normalized = code.startsWith('+') ? code : `+${code.replace(/^0+/, '')}`
  return `${normalized} ${phone}`
})

const vehicleTitle = computed(
  () =>
    props.item.vehicleName ||
    props.item.vehicle.model ||
    t('site.profile.transportation.card.unknownVehicle'),
)

const driverName = computed(
  () =>
    props.item.driver.name ||
    t('site.profile.transportation.card.unknownDriver'),
)

const driverInitials = computed(() => {
  const parts = driverName.value.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return parts
    .slice(0, 2)
    .map((part) => part[0]!)
    .join('')
    .toUpperCase()
})

const vehicleImageFailed = ref(false)
const driverAvatarFailed = ref(false)

watch(
  () => props.item.id,
  () => {
    vehicleImageFailed.value = false
    driverAvatarFailed.value = false
  },
)

const showVehicleImage = computed(
  () => Boolean(props.item.vehicleImage) && !vehicleImageFailed.value,
)

const showDriverAvatar = computed(
  () => Boolean(props.item.driver.avatar) && !driverAvatarFailed.value,
)
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
      class="absolute inset-y-0 end-0 flex w-7 items-center justify-center sm:w-9"
      :class="statusUi.strip"
      aria-hidden="true"
    >
      <span
        class="origin-center -rotate-180 text-[0.6rem] font-bold tracking-wide text-white [writing-mode:vertical-rl] sm:text-xs"
      >
        {{ statusLabel }}
      </span>
    </div>

    <div class="pe-8 sm:pe-12">
      <div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <div class="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <div
            class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-ibbil-green/10 text-base font-bold text-ibbil-green sm:size-16 sm:text-lg"
            role="img"
            :aria-label="showVehicleImage ? vehicleTitle : driverName"
          >
            <img
              v-if="showVehicleImage"
              :src="item.vehicleImage"
              :alt="vehicleTitle"
              class="size-full object-cover"
              loading="lazy"
              decoding="async"
              @error="vehicleImageFailed = true"
            >
            <span v-else>{{ driverInitials }}</span>
          </div>

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold text-ibbil-green sm:text-base">
              {{ vehicleTitle }}
            </p>
            <p class="mt-0.5 text-xs text-foreground-muted sm:text-sm">
              {{ t('site.profile.transportation.card.tripNumber', { id: item.id }) }}
            </p>
            <p v-if="dateLabel" class="mt-0.5 text-xs text-foreground-muted">
              {{ t('site.profile.transportation.card.scheduledAt', { date: dateLabel }) }}
            </p>
            <div class="mt-2 flex min-w-0 items-center gap-2">
              <div
                class="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ibbil-green/10 text-[0.65rem] font-bold text-ibbil-green ring-1 ring-ibbil-green/15"
                role="img"
                :aria-label="driverName"
              >
                <img
                  v-if="showDriverAvatar"
                  :src="item.driver.avatar"
                  :alt="driverName"
                  class="size-full object-cover"
                  loading="lazy"
                  decoding="async"
                  referrerpolicy="no-referrer"
                  @error="driverAvatarFailed = true"
                >
                <span v-else>{{ driverInitials }}</span>
              </div>
              <p class="truncate text-xs font-medium text-foreground sm:text-sm">
                {{ driverName }}
              </p>
            </div>
          </div>
        </div>

        <div class="min-w-0 flex-1 space-y-2">
          <div class="flex items-start gap-2 text-sm">
            <Icon
              name="lucide:circle-dot"
              class="mt-0.5 size-3.5 shrink-0 text-ibbil-green"
              aria-hidden="true"
            />
            <p class="min-w-0 break-words text-foreground">
              <span class="sr-only">{{ t('site.profile.transportation.card.from') }}:</span>
              {{ item.startAddress || '—' }}
            </p>
          </div>
          <div class="flex items-start gap-2 text-sm">
            <Icon
              name="lucide:map-pin"
              class="mt-0.5 size-3.5 shrink-0 text-ibbil-gold"
              aria-hidden="true"
            />
            <p class="min-w-0 break-words text-foreground">
              <span class="sr-only">{{ t('site.profile.transportation.card.to') }}:</span>
              {{ item.endAddress || '—' }}
            </p>
          </div>
          <p class="text-sm font-semibold text-foreground sm:text-center">
            <span class="font-medium text-foreground-muted">
              {{ t('site.profile.transportation.card.total') }}:
            </span>
            <MoneyAmount :amount="item.price" class="ms-1" />
          </p>
        </div>

        <div class="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
          <div class="flex flex-wrap items-center gap-2">
            <BaseBadge :variant="statusUi.variant" size="sm">
              {{ statusLabel }}
            </BaseBadge>
            <BaseBadge v-if="distanceLabel" variant="secondary" size="sm">
              {{ distanceLabel }}
            </BaseBadge>
          </div>

          <BaseButton
            variant="ghost"
            size="sm"
            class="!rounded-xl !px-2"
            :aria-expanded="expanded"
            :aria-label="
              expanded
                ? t('site.profile.transportation.card.collapse')
                : t('site.profile.transportation.card.expand')
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
              {{ t('site.profile.transportation.card.routeTitle') }}
            </h4>
            <dl class="space-y-2.5 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.transportation.card.distance') }}</dt>
                <dd class="text-end font-medium text-foreground">{{ distanceLabel || '—' }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.transportation.card.camels') }}</dt>
                <dd class="text-end font-medium tabular-nums text-foreground">
                  {{ n(item.camelCount) }}
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.transportation.card.date') }}</dt>
                <dd class="text-end font-medium text-foreground">{{ dateLabel || '—' }}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h4 class="mb-3 text-sm font-bold text-ibbil-green">
              {{ t('site.profile.transportation.card.detailsTitle') }}
            </h4>
            <div
              v-if="driverPhone"
              class="mb-4 rounded-xl border border-ibbil-green/10 bg-white px-3 py-2.5 dark:bg-surface-elevated"
            >
              <p class="text-xs text-foreground-muted">
                {{ t('site.profile.transportation.card.driver') }}
              </p>
              <p dir="ltr" class="mt-0.5 truncate text-sm font-medium text-foreground">
                {{ driverPhone }}
              </p>
            </div>

            <dl class="space-y-2.5 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.transportation.card.vehicleModel') }}</dt>
                <dd class="text-end font-medium text-foreground">
                  {{ item.vehicle.model || '—' }}
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.transportation.card.plateNumber') }}</dt>
                <dd dir="ltr" class="text-end font-medium tabular-nums text-foreground">
                  {{ item.vehicle.plateNumber || '—' }}
                </dd>
              </div>
              <div v-if="item.vehicle.year" class="flex justify-between gap-3">
                <dt class="text-foreground-muted">{{ t('site.profile.transportation.card.year') }}</dt>
                <dd class="text-end font-medium text-foreground">{{ item.vehicle.year }}</dd>
              </div>
              <div class="flex justify-between gap-3 border-t border-border pt-2.5">
                <dt class="font-semibold text-ibbil-green">{{ t('site.profile.transportation.card.total') }}</dt>
                <dd class="font-bold text-ibbil-green">
                  <MoneyAmount :amount="item.price" />
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  </article>
</template>
