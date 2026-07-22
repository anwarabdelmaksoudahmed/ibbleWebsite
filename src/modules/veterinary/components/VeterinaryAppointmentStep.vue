<script setup lang="ts">
import VeterinaryDoctorSummary from '@modules/veterinary/components/VeterinaryDoctorSummary.vue'
import type { VeterinaryServiceTypeId } from '@modules/veterinary/constants/routes'
import type {
  VeterinaryAppointmentDay,
  VeterinaryAppointmentSlot,
  VeterinaryDoctor,
} from '@modules/veterinary/types'
import { summarizeDayPeriod } from '@modules/veterinary/utils/appointment-slots'

const props = defineProps<{
  doctor: VeterinaryDoctor
  serviceType: VeterinaryServiceTypeId
  view: 'days' | 'slots'
  days: VeterinaryAppointmentDay[]
  slots: VeterinaryAppointmentSlot[]
  selectedDay: VeterinaryAppointmentDay | null
  loadingSlots: boolean
  slotsError: boolean
  canReserveDay: boolean
}>()

const emit = defineEmits<{
  openDay: [day: VeterinaryAppointmentDay]
  selectSlot: [slot: VeterinaryAppointmentSlot]
  changeDay: []
  retrySlots: []
}>()

const { t, locale } = useI18n()

const daySwiperBreakpoints = {
  640: { slidesPerView: 1.45, spaceBetween: 14 },
  768: { slidesPerView: 2.1, spaceBetween: 16 },
  1024: { slidesPerView: 2.8, spaceBetween: 18 },
}

function formatDayLabel(day: VeterinaryAppointmentDay): string {
  if (day.isToday) return t('site.veterinary.book.appointment.today')

  const date = new Date(`${day.date}T12:00:00`)
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

function formatShortDay(day: VeterinaryAppointmentDay): string {
  const date = new Date(`${day.date}T12:00:00`)
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
  }).format(date)
}

function formatShortDate(day: VeterinaryAppointmentDay): string {
  const date = new Date(`${day.date}T12:00:00`)
  return new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'long',
  }).format(date)
}

function daySummary(day: VeterinaryAppointmentDay): string {
  return summarizeDayPeriod(props.doctor, day.day, locale.value)
}
</script>

<template>
  <div class="space-y-6">
    <VeterinaryDoctorSummary :doctor="doctor" :service-type="serviceType" compact />

    <section class="space-y-5">
      <h2 class="text-center text-lg font-extrabold tracking-tight text-ibbil-green sm:text-xl">
        {{ t('site.veterinary.book.appointment.title') }}
      </h2>

      <div v-if="view === 'days'" class="space-y-4">
        <BaseEmptyState
          v-if="!days.length"
          variant="brand"
          icon="lucide:calendar-x"
          :title="t('site.veterinary.book.appointment.noDaysTitle')"
          :description="t('site.veterinary.book.appointment.noDaysDescription')"
        />

        <BaseSwiper
          v-else
          :items="days"
          :slides-per-view="1.08"
          :space-between="12"
          :breakpoints="daySwiperBreakpoints"
          :navigation="days.length > 1"
          :pagination="days.length > 1 ? 'bullets' : false"
          controls-position="outside"
          controls-variant="dark"
          :label="t('site.veterinary.book.appointment.title')"
          class="appointment-days-swiper"
          swiper-class="!overflow-visible"
        >
          <template #slide="{ item: day }">
            <article
              class="h-full rounded-2xl border border-ibbil-green/10 bg-white p-5 shadow-[0_12px_35px_-24px_rgba(45,83,61,0.55)] transition hover:-translate-y-0.5 hover:border-ibbil-green/20 hover:shadow-[0_18px_42px_-26px_rgba(45,83,61,0.55)]"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-bold text-ibbil-green">{{ formatDayLabel(day) }}</p>
                  <p class="mt-1 text-xs text-foreground-muted">{{ formatShortDate(day) }}</p>
                </div>
                <span
                  v-if="day.isToday"
                  class="shrink-0 rounded-full bg-ibbil-gold/20 px-2.5 py-1 text-[11px] font-bold text-ibbil-green-dark"
                >
                  {{ t('site.veterinary.book.appointment.today') }}
                </span>
              </div>

              <div class="mt-4 rounded-xl bg-ibbil-green/[0.045] px-3 py-2.5">
                <p class="text-xs font-semibold text-ibbil-green/90">
                  {{ t('site.veterinary.book.appointment.fromTo', { range: daySummary(day) }) }}
                </p>
              </div>

              <BaseButton
                variant="brand"
                class="mt-5 w-full !rounded-lg !py-2.5 !text-sm !font-bold"
                @click="emit('openDay', day)"
              >
                {{ t('site.veterinary.book.appointment.bookDay') }}
              </BaseButton>
            </article>
          </template>
        </BaseSwiper>
      </div>

      <div v-else class="space-y-4">
        <BaseErrorState
          v-if="slotsError"
          :title="t('site.veterinary.book.appointment.slotsErrorTitle')"
          :message="t('site.veterinary.book.appointment.slotsErrorDescription')"
          @retry="emit('retrySlots')"
        />

        <div
          v-else
          class="overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white shadow-[0_16px_40px_-28px_rgba(45,83,61,0.6)]"
        >
          <div class="grid lg:grid-cols-[12rem_minmax(0,1fr)]">
            <aside class="border-b border-ibbil-green/10 bg-ibbil-green/[0.06] p-5 lg:border-b-0 lg:border-e">
              <p class="text-sm font-bold text-ibbil-green">
                {{ selectedDay ? formatShortDay(selectedDay) : '—' }}
              </p>
              <p class="mt-1 text-sm text-foreground-muted">
                {{ selectedDay ? formatShortDate(selectedDay) : '' }}
              </p>
              <BaseButton
                type="button"
                variant="secondary"
                class="mt-4 !w-full !rounded-lg !border-ibbil-green/20 !bg-white !py-2 !text-xs !font-bold !text-ibbil-green hover:!border-ibbil-green/35"
                @click="emit('changeDay')"
              >
                {{ t('site.veterinary.book.appointment.changeDay') }}
              </BaseButton>
            </aside>

            <div class="p-5">
              <div v-if="loadingSlots" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <BaseSkeleton v-for="index in 4" :key="index" class="h-12 rounded-xl" />
              </div>

              <BaseEmptyState
                v-else-if="!canReserveDay"
                variant="brand"
                icon="lucide:calendar-off"
                :title="t('site.veterinary.book.appointment.unavailableTitle')"
                :description="t('site.veterinary.book.appointment.unavailableDescription')"
              />

              <BaseEmptyState
                v-else-if="!slots.length"
                variant="brand"
                icon="lucide:clock"
                :title="t('site.veterinary.book.appointment.noSlotsTitle')"
                :description="t('site.veterinary.book.appointment.noSlotsDescription')"
              />

              <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <button
                  v-for="slot in slots"
                  :key="`${slot.from}-${slot.to}`"
                  type="button"
                  class="rounded-xl border border-ibbil-green/15 bg-[#fafbfa] px-4 py-3 text-sm font-bold text-ibbil-green transition hover:-translate-y-0.5 hover:border-ibbil-green hover:bg-ibbil-green/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-gold/55"
                  @click="emit('selectSlot', slot)"
                >
                  {{ slot.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
