<script setup lang="ts">
import type {
  InsuranceCargoDraftValues,
  InsuranceCargoItem,
  InsuranceShipmentFormValues,
  InsuranceShipmentTripField,
} from '@modules/insurance/schemas/shipment.schema'

const props = defineProps<{
  model: InsuranceShipmentFormValues
  tripErrors: Partial<Record<InsuranceShipmentTripField, string>>
  cargoDraft: InsuranceCargoDraftValues
  cargoDraftErrors: Partial<Record<keyof InsuranceCargoDraftValues, string>>
  cargoItemsError?: string
  draftStatusLabel: string
  chipDraftStatus?: string
  totalCargoValue: number
  isEditingCargo: boolean
  editingCargoId?: string | null
  isCheckingChip?: boolean
}>()

const emit = defineEmits<{
  'update:cargoValue': [value: string | number]
  'update:distanceKm': [value: string | number]
  'cargo-field-blur': [field: keyof InsuranceCargoDraftValues]
  'trip-field-blur': [field: InsuranceShipmentTripField]
  'save-cargo': []
  'add-cargo': []
  'edit-cargo': [id: string]
  'remove-cargo': [id: string]
  'reset-cargo': []
}>()

const { t, locale } = useI18n()

const today = computed(() => new Date().toISOString().slice(0, 10))

const statusToneClass = computed(() => {
  switch (props.chipDraftStatus) {
    case 'exists':
      return 'border-success/30 bg-success/5 text-success'
    case 'not_exists':
    case 'duplicated':
      return 'border-danger/30 bg-danger/5 text-danger'
    case 'checking':
      return 'border-ibbil-green/20 bg-ibbil-green/5 text-ibbil-green'
    default:
      return 'border-border bg-white text-foreground-muted dark:bg-surface'
  }
})

function formatMoney(amount: number) {
  const numberLocale = locale.value === 'ar' ? 'ar-SA' : 'en-SA'
  const formatted = new Intl.NumberFormat(numberLocale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)

  return `${formatted} ${t('site.insurance.register.form.currency')}`
}

const formattedTotal = computed(() => formatMoney(props.totalCargoValue))

function cargoValueLabel(item: InsuranceCargoItem) {
  return formatMoney(Number(item.cargoValue))
}

function onTransportDateChange(value: string) {
  props.model.transportDate = value
  emit('trip-field-blur', 'transportDate')
}
</script>

<template>
  <form class="space-y-8" novalidate @submit.prevent>
    <section aria-labelledby="insurance-cargo-heading" class="space-y-4">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="insurance-cargo-heading"
            class="text-base font-bold text-ibbil-green sm:text-lg"
          >
            {{ t('site.insurance.register.sections.cargo') }}
          </h2>
          <p class="mt-1 text-sm text-foreground-muted">
            {{ t('site.insurance.register.sections.cargoHint') }}
          </p>
        </div>
        <BaseBadge v-if="model.items.length" variant="brand" size="md">
          {{ t('site.insurance.register.form.cargoCount', { count: model.items.length }) }}
        </BaseBadge>
      </div>

      <div
        class="rounded-2xl border border-ibbil-green/10 bg-[#fafbfa] p-4 transition-colors dark:bg-surface-muted sm:p-5"
      >
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BaseInput
            v-model="cargoDraft.serialNumber"
            autocomplete="off"
            :label="t('site.insurance.register.form.serialNumber')"
            :placeholder="t('site.insurance.register.form.serialNumberPlaceholder')"
            :hint="t('site.insurance.register.hints.serialNumber')"
            :error="cargoDraftErrors.serialNumber"
            :disabled="isCheckingChip"
            required
            @blur="emit('cargo-field-blur', 'serialNumber')"
          />

          <BaseInput
            :model-value="cargoDraft.cargoValue"
            inputmode="decimal"
            autocomplete="off"
            :label="t('site.insurance.register.form.cargoValue')"
            :placeholder="t('site.insurance.register.form.cargoValuePlaceholder')"
            :hint="t('site.insurance.register.hints.cargoValue')"
            :error="cargoDraftErrors.cargoValue"
            :disabled="isCheckingChip"
            required
            @update:model-value="emit('update:cargoValue', $event)"
            @blur="emit('cargo-field-blur', 'cargoValue')"
          >
            <template #suffix>
              <span class="text-xs font-semibold text-foreground-muted">
                {{ t('site.insurance.register.form.currency') }}
              </span>
            </template>
          </BaseInput>

          <div class="space-y-1.5">
            <span class="block text-sm font-semibold text-ibbil-green">
              {{ t('site.insurance.register.form.status') }}
            </span>
            <div
              class="flex min-h-[46px] items-center gap-2 rounded-xl border px-3.5 py-3 text-sm font-medium transition-colors"
              :class="statusToneClass"
              role="status"
              aria-live="polite"
            >
              <BaseLoader v-if="isCheckingChip" size="sm" class="text-current" />
              <Icon
                v-else-if="chipDraftStatus === 'exists'"
                name="lucide:circle-check"
                class="size-4 shrink-0"
                aria-hidden="true"
              />
              <Icon
                v-else-if="chipDraftStatus === 'not_exists' || chipDraftStatus === 'duplicated'"
                name="lucide:circle-x"
                class="size-4 shrink-0"
                aria-hidden="true"
              />
              {{ draftStatusLabel }}
            </div>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <BaseButton
            type="button"
            variant="warning"
            size="md"
            class="!rounded-xl"
            :loading="isCheckingChip"
            :disabled="isCheckingChip"
            @click="emit('save-cargo')"
          >
            <Icon name="lucide:check" class="size-4" aria-hidden="true" />
            {{
              isEditingCargo
                ? t('site.insurance.register.actions.saveChanges')
                : t('site.insurance.register.actions.saveCargo')
            }}
          </BaseButton>

          <BaseButton
            type="button"
            variant="brand"
            size="md"
            class="!rounded-xl !px-4 !py-2.5 !text-sm"
            :loading="isCheckingChip"
            :disabled="isCheckingChip"
            @click="emit('add-cargo')"
          >
            <Icon name="lucide:plus" class="size-4" aria-hidden="true" />
            {{ t('site.insurance.register.actions.addCargo') }}
          </BaseButton>

          <BaseButton
            v-if="isEditingCargo || cargoDraft.serialNumber || cargoDraft.cargoValue"
            type="button"
            variant="ghost"
            size="md"
            class="!rounded-xl"
            :disabled="isCheckingChip"
            @click="emit('reset-cargo')"
          >
            {{ t('site.insurance.register.actions.clearDraft') }}
          </BaseButton>
        </div>
      </div>

      <p
        v-if="cargoItemsError"
        class="text-sm text-danger"
        role="alert"
      >
        {{ cargoItemsError }}
      </p>

      <BaseEmptyState
        v-if="!model.items.length"
        variant="brand"
        icon="lucide:package-open"
        :title="t('site.insurance.register.empty.cargoTitle')"
        :description="t('site.insurance.register.empty.cargoDescription')"
        class="!py-10"
      />

      <ul
        v-else
        class="space-y-3"
        :aria-label="t('site.insurance.register.sections.cargoList')"
      >
        <li
          v-for="item in model.items"
          :key="item.id"
          class="group flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4 transition-all hover:border-ibbil-green/25 hover:shadow-sm dark:bg-surface"
          :class="
            editingCargoId === item.id
              ? 'border-ibbil-green/40 ring-2 ring-ibbil-green/15'
              : 'border-border'
          "
        >
          <div class="flex min-w-0 flex-1 items-start gap-3">
            <div
              class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-ibbil-green/10 text-ibbil-green"
              aria-hidden="true"
            >
              <Icon name="lucide:tag" class="size-5" />
            </div>
            <div class="min-w-0">
              <p class="truncate font-semibold text-foreground">
                {{ item.serialNumber }}
              </p>
              <p class="mt-0.5 text-sm text-foreground-muted">
                {{ cargoValueLabel(item) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <BaseBadge variant="success" size="sm" dot>
              {{ t('site.insurance.register.form.cargoStatusExists') }}
            </BaseBadge>

            <BaseButton
              type="button"
              variant="ghost"
              size="sm"
              class="!rounded-lg"
              :aria-label="t('site.insurance.register.actions.editCargo')"
              @click="emit('edit-cargo', item.id)"
            >
              <Icon name="lucide:pencil" class="size-4" aria-hidden="true" />
            </BaseButton>

            <BaseButton
              type="button"
              variant="ghost"
              size="sm"
              class="!rounded-lg text-danger hover:bg-danger/10"
              :aria-label="t('site.insurance.register.actions.removeCargo')"
              @click="emit('remove-cargo', item.id)"
            >
              <Icon name="lucide:trash-2" class="size-4" aria-hidden="true" />
            </BaseButton>
          </div>
        </li>
      </ul>
    </section>

    <section aria-labelledby="insurance-trip-heading" class="space-y-4">
      <div>
        <h2
          id="insurance-trip-heading"
          class="text-base font-bold text-ibbil-green sm:text-lg"
        >
          {{ t('site.insurance.register.sections.trip') }}
        </h2>
        <p class="mt-1 text-sm text-foreground-muted">
          {{ t('site.insurance.register.sections.tripHint') }}
        </p>
      </div>

      <div class="space-y-4">
        <BaseDatePicker
          :model-value="model.transportDate"
          :label="t('site.insurance.register.form.transportDate')"
          :hint="t('site.insurance.register.hints.transportDate')"
          :error="tripErrors.transportDate"
          :min="today"
          @update:model-value="onTransportDateChange"
        />

        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput
            v-model="model.origin"
            autocomplete="address-level2"
            :label="t('site.insurance.register.form.origin')"
            :placeholder="t('site.insurance.register.form.originPlaceholder')"
            :error="tripErrors.origin"
            required
            @blur="emit('trip-field-blur', 'origin')"
          />

          <BaseInput
            v-model="model.destination"
            autocomplete="address-level2"
            :label="t('site.insurance.register.form.destination')"
            :placeholder="t('site.insurance.register.form.destinationPlaceholder')"
            :error="tripErrors.destination"
            required
            @blur="emit('trip-field-blur', 'destination')"
          />
        </div>

        <BaseInput
          :model-value="model.distanceKm"
          inputmode="decimal"
          autocomplete="off"
          :label="t('site.insurance.register.form.distanceKm')"
          :placeholder="t('site.insurance.register.form.distanceKmPlaceholder')"
          :hint="t('site.insurance.register.hints.distanceKm')"
          :error="tripErrors.distanceKm"
          required
          @update:model-value="emit('update:distanceKm', $event)"
          @blur="emit('trip-field-blur', 'distanceKm')"
        >
          <template #suffix>
            <span class="text-xs font-semibold text-foreground-muted">
              {{ t('site.insurance.register.form.kmUnit') }}
            </span>
          </template>
        </BaseInput>
      </div>
    </section>

    <div
      class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ibbil-green/15 bg-ibbil-green/[0.06] px-4 py-4 sm:px-5"
      role="status"
      aria-live="polite"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex size-10 items-center justify-center rounded-xl bg-ibbil-green/10 text-ibbil-green"
          aria-hidden="true"
        >
          <Icon name="lucide:shield-check" class="size-5" />
        </div>
        <p class="text-sm font-semibold text-ibbil-green sm:text-base">
          {{ t('site.insurance.register.form.totalCargoValue') }}
        </p>
      </div>
      <p class="text-lg font-extrabold tracking-tight text-ibbil-green sm:text-xl">
        {{ formattedTotal }}
      </p>
    </div>
  </form>
</template>
