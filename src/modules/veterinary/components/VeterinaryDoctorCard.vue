<script setup lang="ts">
import type { VeterinaryServiceTypeId } from '@modules/veterinary/constants/routes'
import { getDoctorPriceForService, getDoctorSubtitle } from '@modules/veterinary/utils/doctor-mappers'
import type { VeterinaryDoctor } from '@modules/veterinary/types'
import { formatMoneyAmount } from '@shared/utils/format-money'

const props = defineProps<{
  doctor: VeterinaryDoctor
  serviceType: VeterinaryServiceTypeId
}>()

const emit = defineEmits<{
  book: []
}>()

const { t, locale } = useI18n()

const subtitle = computed(() => getDoctorSubtitle(props.doctor, t))
const price = computed(() => getDoctorPriceForService(props.doctor, props.serviceType))
const rating = computed(() => props.doctor.totalStars ?? 5)
</script>

<template>
  <article class="rounded-2xl border border-ibbil-green/10 bg-white p-4 shadow-sm sm:p-5">
    <div class="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_auto_auto] xl:items-center">
      <div class="flex min-w-0 items-start gap-4">
        <div class="size-20 shrink-0 overflow-hidden rounded-xl border border-ibbil-green/10 bg-[#fafbfa]">
          <BaseImage
            v-if="doctor.personalPicture"
            :src="doctor.personalPicture"
            :alt="doctor.fullName"
            width="80"
            height="80"
            object-fit="cover"
            rounded="lg"
            class="!size-full"
          />
          <div v-else class="flex size-full items-center justify-center text-ibbil-green/50">
            <Icon name="lucide:user-round" class="size-8" aria-hidden="true" />
          </div>
        </div>

        <div class="min-w-0 space-y-2">
          <p class="text-xs font-semibold text-foreground-muted">
            {{ t('site.veterinary.book.doctor.label') }}
          </p>
          <h3 class="text-base font-extrabold text-ibbil-green sm:text-lg">
            {{ doctor.fullName }}
          </h3>
          <p class="text-sm font-semibold text-ibbil-gold">{{ subtitle }}</p>
          <p class="line-clamp-2 text-sm text-foreground-muted">{{ doctor.description }}</p>
          <div class="flex items-center gap-1">
            <Icon
              v-for="index in 5"
              :key="index"
              name="lucide:star"
              class="size-3.5"
              :class="index <= rating ? 'fill-ibbil-gold text-ibbil-gold' : 'text-ibbil-green/15'"
              aria-hidden="true"
            />
            <span class="text-xs text-foreground-muted">({{ rating }})</span>
          </div>
          <p
            v-if="doctor.examineMethod === 'appointment'"
            class="inline-flex items-center gap-1.5 text-xs font-semibold text-ibbil-green"
          >
            <Icon name="lucide:badge-check" class="size-3.5" aria-hidden="true" />
            {{ t('site.veterinary.book.doctor.scheduledAppointment') }}
          </p>
        </div>
      </div>

      <div class="space-y-1 xl:min-w-[10rem]">
        <p class="text-xs font-medium text-foreground-muted">{{ t('site.veterinary.book.doctor.address') }}</p>
        <p class="text-sm font-bold text-foreground">{{ doctor.clinicAddress || '—' }}</p>
      </div>

      <div class="flex flex-col gap-3 xl:min-w-[9rem] xl:items-end">
        <div class="space-y-1 xl:text-end">
          <p class="text-xs font-medium text-foreground-muted">{{ t('site.veterinary.book.doctor.price') }}</p>
          <p class="text-lg font-extrabold text-ibbil-green">
            {{ formatMoneyAmount(price, locale) }}
            <SaudiRiyalSymbol class="ms-1 text-[0.85em]" />
          </p>
        </div>
        <BaseButton
          variant="brand"
          class="!rounded-lg !px-5 !py-2.5 !text-sm !font-bold xl:w-full"
          @click="emit('book')"
        >
          {{ t('site.veterinary.book.doctor.book') }}
        </BaseButton>
      </div>
    </div>
  </article>
</template>
