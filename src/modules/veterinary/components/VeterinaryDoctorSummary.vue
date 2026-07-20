<script setup lang="ts">
import type { VeterinaryServiceTypeId } from '@modules/veterinary/constants/routes'
import { getDoctorPriceForService, getDoctorSubtitle } from '@modules/veterinary/utils/doctor-mappers'
import type { VeterinaryDoctor } from '@modules/veterinary/types'
import { formatMoneyAmount } from '@shared/utils/format-money'

const props = defineProps<{
  doctor: VeterinaryDoctor
  serviceType: VeterinaryServiceTypeId
  compact?: boolean
}>()

const { t, locale } = useI18n()

const subtitle = computed(() => getDoctorSubtitle(props.doctor, t))
const price = computed(() => getDoctorPriceForService(props.doctor, props.serviceType))
const rating = computed(() => props.doctor.totalStars ?? 5)
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white shadow-sm"
    :class="compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'"
  >
    <div class="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_auto_auto] lg:items-center">
      <div class="flex min-w-0 items-start gap-4">
        <div
          class="size-20 shrink-0 overflow-hidden rounded-xl border border-ibbil-green/10 bg-[#fafbfa] sm:size-24"
        >
          <BaseImage
            v-if="doctor.personalPicture"
            :src="doctor.personalPicture"
            :alt="doctor.fullName"
            width="96"
            height="96"
            object-fit="cover"
            rounded="lg"
            class="!size-full"
          />
          <div v-else class="flex size-full items-center justify-center text-ibbil-green/50">
            <Icon name="lucide:user-round" class="size-10" aria-hidden="true" />
          </div>
        </div>

        <div class="min-w-0 space-y-2">
          <p class="text-xs font-semibold text-foreground-muted">
            {{ t('site.veterinary.book.doctor.label') }}
          </p>
          <h3 class="text-lg font-extrabold text-ibbil-green sm:text-xl">
            {{ doctor.fullName }}
          </h3>
          <p class="text-sm font-semibold text-ibbil-gold">
            {{ subtitle }}
          </p>
          <p v-if="doctor.description" class="text-sm leading-relaxed text-foreground-muted">
            {{ doctor.description }}
          </p>
          <div class="flex items-center gap-1.5" :aria-label="t('site.veterinary.book.doctor.ratingLabel', { count: rating })">
            <Icon
              v-for="index in 5"
              :key="index"
              name="lucide:star"
              class="size-4"
              :class="index <= rating ? 'fill-ibbil-gold text-ibbil-gold' : 'text-ibbil-green/15'"
              aria-hidden="true"
            />
            <span class="text-xs font-semibold text-foreground-muted">({{ rating }})</span>
          </div>
        </div>
      </div>

      <div class="min-w-[9rem] space-y-1">
        <p class="text-xs font-medium text-foreground-muted">
          {{ t('site.veterinary.book.doctor.address') }}
        </p>
        <p class="text-sm font-bold leading-relaxed text-foreground">
          {{ doctor.clinicAddress || '—' }}
        </p>
      </div>

      <div class="min-w-[8rem] space-y-1 lg:text-end">
        <p class="text-xs font-medium text-foreground-muted">
          {{ t('site.veterinary.book.doctor.price') }}
        </p>
        <p class="text-xl font-extrabold text-ibbil-green">
          {{ formatMoneyAmount(price, locale) }}
          <SaudiRiyalSymbol class="ms-1 text-[0.85em]" />
        </p>
      </div>
    </div>
  </div>
</template>
