<script setup lang="ts">
import VeterinaryDoctorCard from '@modules/veterinary/components/VeterinaryDoctorCard.vue'
import type { VeterinaryDoctorSortId, VeterinaryServiceTypeId } from '@modules/veterinary/constants/routes'
import type { VeterinaryDoctor } from '@modules/veterinary/types'

defineProps<{
  doctors: VeterinaryDoctor[]
  serviceType: VeterinaryServiceTypeId
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  error: boolean
  searchQuery: string
  cityFilter: string
  sortBy: VeterinaryDoctorSortId
  cityOptions: Array<{ value: string; label: string }>
  sortOptions: Array<{ value: VeterinaryDoctorSortId; label: string }>
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:cityFilter': [value: string]
  'update:sortBy': [value: VeterinaryDoctorSortId]
  book: [doctor: VeterinaryDoctor]
  loadMore: []
  retry: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="space-y-5">
    <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_10rem_11rem_auto] lg:items-end">
      <BaseSearchInput
        :model-value="searchQuery"
        :placeholder="t('site.veterinary.book.doctor.searchPlaceholder')"
        :aria-label="t('site.veterinary.book.doctor.searchPlaceholder')"
        @update:model-value="emit('update:searchQuery', $event)"
      />

      <BaseSelect
        :model-value="cityFilter"
        :label="t('site.veterinary.book.doctor.city')"
        :options="cityOptions"
        @update:model-value="emit('update:cityFilter', String($event))"
      />

      <BaseSelect
        :model-value="sortBy"
        :label="t('site.veterinary.book.doctor.sortLabel')"
        :options="sortOptions"
        @update:model-value="emit('update:sortBy', $event as VeterinaryDoctorSortId)"
      />
    </div>

    <BaseErrorState
      v-if="error"
      :title="t('site.veterinary.book.doctor.errorTitle')"
      :message="t('site.veterinary.book.doctor.errorDescription')"
      @retry="emit('retry')"
    />

    <div v-else-if="loading" class="space-y-4">
      <BaseSkeleton v-for="index in 3" :key="index" class="h-40 rounded-2xl" />
    </div>

    <BaseEmptyState
      v-else-if="!doctors.length"
      variant="brand"
      icon="lucide:stethoscope"
      :title="t('site.veterinary.book.doctor.emptyTitle')"
      :description="t('site.veterinary.book.doctor.emptyDescription')"
    />

    <div v-else class="space-y-4">
      <VeterinaryDoctorCard
        v-for="doctor in doctors"
        :key="doctor.id"
        :doctor="doctor"
        :service-type="serviceType"
        @book="emit('book', doctor)"
      />

      <div v-if="hasMore" class="flex justify-center pt-2">
        <BaseButton
          variant="outline"
          class="!rounded-lg"
          :loading="loadingMore"
          @click="emit('loadMore')"
        >
          {{ t('site.veterinary.book.doctor.loadMore') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
