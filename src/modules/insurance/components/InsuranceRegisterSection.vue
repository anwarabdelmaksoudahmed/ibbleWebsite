<script setup lang="ts">
import InsuranceCustomerStep from '@modules/insurance/components/InsuranceCustomerStep.vue'
import InsuranceShipmentStep from '@modules/insurance/components/InsuranceShipmentStep.vue'
import { INSURANCE_ROUTES } from '@modules/insurance/constants/routes'
import { useInsuranceRegisterWizard } from '@modules/insurance/composables/useInsuranceRegisterWizard'
import { ROUTES } from '@shared/constants/routes'

const { t } = useI18n()
const localePath = useLocalePath()

const {
  steps,
  currentStep,
  activeStep,
  customer,
  customerErrors,
  shipment,
  shipmentTripErrors,
  cargoItemsError,
  cargoDraft,
  cargoDraftErrors,
  draftStatusLabel,
  chipDraftStatus,
  isCheckingChip,
  totalCargoValue,
  isEditingCargo,
  editingCargoId,
  isFirstStep,
  isLastStep,
  next,
  prev,
  setNationalId,
  touchCustomerField,
  touchCargoDraftField,
  touchShipmentTripField,
  setCargoValue,
  setDistanceKm,
  saveCargoDraft,
  startNewCargo,
  editCargoItem,
  removeCargoItem,
  resetCargoDraft,
} = useInsuranceRegisterWizard()

const breadcrumbItems = computed(() => [
  { label: t('site.nav.home'), to: localePath(ROUTES.HOME) },
  { label: t('site.nav.insurance'), to: localePath(INSURANCE_ROUTES.ROOT) },
  { label: t('site.insurance.register.breadcrumb') },
])

async function onNext() {
  if (isLastStep.value) return
  await next()
}
</script>

<template>
  <section class="bg-[#f4f6f5] dark:bg-background">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-6 lg:py-12">
      <BaseBreadcrumb :items="breadcrumbItems" class="mb-6" />

      <header class="mb-8 text-center">
        <h1 class="text-2xl font-extrabold tracking-tight text-ibbil-green sm:text-3xl">
          {{ t('site.insurance.register.title') }}
        </h1>
        <p class="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-foreground-muted sm:text-base">
          {{ t('site.insurance.register.subtitle') }}
        </p>
      </header>

      <FormWizardShell
        :steps="steps"
        :current-step="currentStep"
        :next-label="t('site.insurance.register.next')"
        :prev-label="t('site.insurance.register.prev')"
        :show-prev="!isFirstStep"
        :progress-label="t('site.insurance.register.progressLabel')"
        @next="onNext"
        @prev="prev"
      >
        <InsuranceCustomerStep
          v-if="activeStep === 'customer'"
          :model="customer"
          :errors="customerErrors"
          @field-blur="touchCustomerField"
          @update:national-id="setNationalId"
        />

        <InsuranceShipmentStep
          v-else-if="activeStep === 'shipment'"
          :model="shipment"
          :trip-errors="shipmentTripErrors"
          :cargo-draft="cargoDraft"
          :cargo-draft-errors="cargoDraftErrors"
          :cargo-items-error="cargoItemsError"
          :draft-status-label="draftStatusLabel"
          :chip-draft-status="chipDraftStatus"
          :total-cargo-value="totalCargoValue"
          :is-editing-cargo="isEditingCargo"
          :editing-cargo-id="editingCargoId"
          :is-checking-chip="isCheckingChip"
          @update:cargo-value="setCargoValue"
          @update:distance-km="setDistanceKm"
          @cargo-field-blur="touchCargoDraftField"
          @trip-field-blur="touchShipmentTripField"
          @save-cargo="saveCargoDraft"
          @add-cargo="startNewCargo"
          @edit-cargo="editCargoItem"
          @remove-cargo="removeCargoItem"
          @reset-cargo="resetCargoDraft"
        />

        <div v-else class="py-6 text-center">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ibbil-green/10 text-ibbil-green">
            <Icon name="lucide:construction" class="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 class="text-lg font-bold text-ibbil-green sm:text-xl">
            {{ t(`site.insurance.register.placeholders.${activeStep}.title`) }}
          </h2>
          <p class="mx-auto mt-2 max-w-md text-sm leading-relaxed text-foreground-muted">
            {{ t(`site.insurance.register.placeholders.${activeStep}.description`) }}
          </p>
        </div>
      </FormWizardShell>
    </div>
  </section>
</template>
