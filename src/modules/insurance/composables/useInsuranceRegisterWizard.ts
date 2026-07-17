import { normalizeApiError } from '@core/api/http/errors'
import { DEFAULT_COUNTRY_CODE } from '@shared/constants/country-codes'
import { createId } from '@shared/utils/id'
import {
  insuranceCustomerSchema,
  type InsuranceCustomerFormValues,
} from '@modules/insurance/schemas/customer.schema'
import {
  insuranceCargoDraftSchema,
  insuranceShipmentSchema,
  type InsuranceCargoDraftValues,
  type InsuranceCargoItem,
  type InsuranceShipmentFormValues,
  type InsuranceShipmentTripField,
} from '@modules/insurance/schemas/shipment.schema'
import {
  INSURANCE_REGISTER_STEPS,
  type InsuranceRegisterStep,
} from '@modules/insurance/constants/routes'
import { getInsuranceService } from '@modules/insurance/services/insurance.service'
import type { InsuranceServiceProvider } from '@modules/insurance/types'

const CUSTOMER_FIELDS = [
  'nationalId',
  'name',
  'phone',
  'countryCode',
  'email',
  'address',
] as const satisfies readonly (keyof InsuranceCustomerFormValues)[]

const CARGO_DRAFT_FIELDS = [
  'serialNumber',
  'cargoValue',
] as const satisfies readonly (keyof InsuranceCargoDraftValues)[]

const SHIPMENT_TRIP_FIELDS = [
  'transportDate',
  'origin',
  'destination',
  'distanceKm',
] as const satisfies readonly InsuranceShipmentTripField[]

export type ChipDraftStatus =
  | 'idle'
  | 'checking'
  | 'exists'
  | 'not_exists'
  | 'duplicated'

function createEmptyCustomerForm(): InsuranceCustomerFormValues {
  return {
    nationalId: '',
    name: '',
    phone: '',
    countryCode: DEFAULT_COUNTRY_CODE.apiCode,
    email: '',
    address: '',
  }
}

function createEmptyCargoDraft(): InsuranceCargoDraftValues {
  return {
    serialNumber: '',
    cargoValue: '',
  }
}

function createEmptyShipmentForm(): InsuranceShipmentFormValues {
  return {
    items: [],
    transportDate: '',
    origin: '',
    destination: '',
    distanceKm: '',
  }
}

export function useInsuranceRegisterWizard() {
  const { t } = useI18n()
  const { user } = useAuth()

  const currentStep = ref(0)
  const customer = reactive<InsuranceCustomerFormValues>(createEmptyCustomerForm())
  const customerErrors = reactive<Partial<Record<keyof InsuranceCustomerFormValues, string>>>({})
  const touchedCustomer = reactive<Partial<Record<keyof InsuranceCustomerFormValues, boolean>>>({})

  const shipment = reactive<InsuranceShipmentFormValues>(createEmptyShipmentForm())
  const shipmentTripErrors = reactive<Partial<Record<InsuranceShipmentTripField, string>>>({})
  const touchedShipmentTrip = reactive<Partial<Record<InsuranceShipmentTripField, boolean>>>({})
  const cargoItemsError = ref<string | undefined>()

  const cargoDraft = reactive<InsuranceCargoDraftValues>(createEmptyCargoDraft())
  const cargoDraftErrors = reactive<Partial<Record<keyof InsuranceCargoDraftValues, string>>>({})
  const touchedCargoDraft = reactive<Partial<Record<keyof InsuranceCargoDraftValues, boolean>>>({})
  const editingCargoId = ref<string | null>(null)
  const chipDraftStatus = ref<ChipDraftStatus>('idle')
  const isCheckingChip = ref(false)

  const providers = ref<InsuranceServiceProvider[]>([])
  const providersLoading = ref(false)
  const providersError = ref<string | null>(null)
  const selectedProviderId = ref<number | null>(null)
  const providerSelectionError = ref<string | undefined>()
  const lastProvidersQueryKey = ref('')

  const steps = computed(() =>
    INSURANCE_REGISTER_STEPS.map((key) => ({
      key,
      label: t(`site.insurance.register.steps.${key}`),
    })),
  )

  const activeStep = computed<InsuranceRegisterStep>(
    () => INSURANCE_REGISTER_STEPS[currentStep.value] ?? 'customer',
  )

  const isFirstStep = computed(() => currentStep.value === 0)
  const isLastStep = computed(() => currentStep.value === INSURANCE_REGISTER_STEPS.length - 1)

  const totalCargoValue = computed(() =>
    shipment.items.reduce((sum, item) => sum + Number(item.cargoValue), 0),
  )

  const selectedProvider = computed(
    () => providers.value.find((provider) => provider.id === selectedProviderId.value) ?? null,
  )

  const providersQueryKey = computed(
    () => `${shipment.distanceKm}|${totalCargoValue.value}`,
  )

  const isEditingCargo = computed(() => editingCargoId.value !== null)

  const draftStatusLabel = computed(() => {
    switch (chipDraftStatus.value) {
      case 'checking':
        return t('site.insurance.register.form.cargoStatusChecking')
      case 'exists':
        return t('site.insurance.register.form.cargoStatusExists')
      case 'not_exists':
        return t('site.insurance.register.form.cargoStatusNotExists')
      case 'duplicated':
        return t('site.insurance.register.form.cargoStatusDuplicated')
      default:
        if (isEditingCargo.value) return t('site.insurance.register.form.cargoStatusEditing')
        if (cargoDraft.serialNumber.trim() || cargoDraft.cargoValue.trim()) {
          return t('site.insurance.register.form.cargoStatusDraft')
        }
        return t('site.insurance.register.form.cargoStatusEmpty')
    }
  })

  function prefillFromUser() {
    if (!user.value) return

    customer.nationalId = user.value.nationalId ?? customer.nationalId
    customer.name = user.value.name ?? customer.name
    customer.phone = user.value.phone ?? customer.phone
    customer.countryCode = user.value.countryCode ?? customer.countryCode
    customer.email = user.value.email ?? customer.email
    customer.address = user.value.address ?? customer.address
  }

  onMounted(prefillFromUser)

  watch(user, prefillFromUser)

  function validateCustomerField(field: keyof InsuranceCustomerFormValues) {
    const result = insuranceCustomerSchema.shape[field].safeParse(customer[field])
    customerErrors[field] = result.success ? undefined : t(result.error.issues[0]!.message)
  }

  function touchAllCustomerFields() {
    for (const field of CUSTOMER_FIELDS) {
      touchedCustomer[field] = true
    }
  }

  function validateAllCustomerFields(): boolean {
    touchAllCustomerFields()
    for (const field of CUSTOMER_FIELDS) {
      validateCustomerField(field)
    }
    return CUSTOMER_FIELDS.every((field) => !customerErrors[field])
  }

  for (const field of CUSTOMER_FIELDS) {
    watch(
      () => customer[field],
      () => {
        if (touchedCustomer[field] || customerErrors[field]) {
          validateCustomerField(field)
        }
      },
    )
  }

  function validateCargoDraftField(field: keyof InsuranceCargoDraftValues) {
    const result = insuranceCargoDraftSchema.shape[field].safeParse(cargoDraft[field])
    cargoDraftErrors[field] = result.success ? undefined : t(result.error.issues[0]!.message)
  }

  function validateAllCargoDraftFields(): boolean {
    for (const field of CARGO_DRAFT_FIELDS) {
      touchedCargoDraft[field] = true
      validateCargoDraftField(field)
    }
    return CARGO_DRAFT_FIELDS.every((field) => !cargoDraftErrors[field])
  }

  for (const field of CARGO_DRAFT_FIELDS) {
    watch(
      () => cargoDraft[field],
      () => {
        if (chipDraftStatus.value !== 'idle' && chipDraftStatus.value !== 'checking') {
          chipDraftStatus.value = 'idle'
        }
        if (touchedCargoDraft[field] || cargoDraftErrors[field]) {
          validateCargoDraftField(field)
        }
      },
    )
  }

  function validateShipmentTripField(field: InsuranceShipmentTripField) {
    const result = insuranceShipmentSchema.shape[field].safeParse(shipment[field])
    shipmentTripErrors[field] = result.success ? undefined : t(result.error.issues[0]!.message)
  }

  function validateCargoItems(): boolean {
    const result = insuranceShipmentSchema.shape.items.safeParse(shipment.items)
    cargoItemsError.value = result.success ? undefined : t(result.error.issues[0]!.message)
    return result.success
  }

  async function validateAllShipmentFields(): Promise<boolean> {
    const hasUnsavedDraft =
      Boolean(cargoDraft.serialNumber.trim()) || Boolean(cargoDraft.cargoValue.trim())

    if (hasUnsavedDraft) {
      const saved = await saveCargoDraft()
      if (!saved) return false
      resetCargoDraft()
    }

    for (const field of SHIPMENT_TRIP_FIELDS) {
      touchedShipmentTrip[field] = true
      validateShipmentTripField(field)
    }
    const tripValid = SHIPMENT_TRIP_FIELDS.every((field) => !shipmentTripErrors[field])
    const itemsValid = validateCargoItems()
    return tripValid && itemsValid
  }

  for (const field of SHIPMENT_TRIP_FIELDS) {
    watch(
      () => shipment[field],
      () => {
        if (touchedShipmentTrip[field] || shipmentTripErrors[field]) {
          validateShipmentTripField(field)
        }
      },
    )
  }

  watch(
    () => shipment.items.length,
    () => {
      if (cargoItemsError.value) validateCargoItems()
    },
  )

  function resetCargoDraft() {
    Object.assign(cargoDraft, createEmptyCargoDraft())
    for (const field of CARGO_DRAFT_FIELDS) {
      cargoDraftErrors[field] = undefined
      touchedCargoDraft[field] = false
    }
    editingCargoId.value = null
    chipDraftStatus.value = 'idle'
  }

  function isDuplicateSerial(serialNumber: string): boolean {
    return shipment.items.some(
      (item) =>
        item.serialNumber === serialNumber &&
        item.id !== editingCargoId.value,
    )
  }

  function upsertCargoItem(serialNumber: string, cargoValue: string): void {
    if (editingCargoId.value) {
      const index = shipment.items.findIndex((item) => item.id === editingCargoId.value)
      if (index === -1) {
        editingCargoId.value = null
        return
      }

      shipment.items[index] = {
        id: editingCargoId.value,
        serialNumber,
        cargoValue,
        status: 'ready',
      }
      return
    }

    const existingIndex = shipment.items.findIndex((item) => item.serialNumber === serialNumber)
    if (existingIndex >= 0) {
      const existing = shipment.items[existingIndex]!
      shipment.items[existingIndex] = {
        ...existing,
        cargoValue,
        status: 'ready',
      }
      editingCargoId.value = existing.id
      return
    }

    const item: InsuranceCargoItem = {
      id: createId(),
      serialNumber,
      cargoValue,
      status: 'ready',
    }
    shipment.items.push(item)
    editingCargoId.value = item.id
  }

  async function verifyChipNumber(serialNumber: string): Promise<boolean> {
    isCheckingChip.value = true
    chipDraftStatus.value = 'checking'

    try {
      const exists = await getInsuranceService().checkChipNumber(serialNumber)
      chipDraftStatus.value = exists ? 'exists' : 'not_exists'
      return exists
    } catch {
      chipDraftStatus.value = 'not_exists'
      return false
    } finally {
      isCheckingChip.value = false
    }
  }

  /** Save: validate + verify chip, then upsert into the cargo list (keeps draft). */
  async function saveCargoDraft(): Promise<boolean> {
    if (isCheckingChip.value) return false
    if (!validateAllCargoDraftFields()) {
      await goToFirstError({ root: '[data-form-wizard-step]' })
      return false
    }

    const serialNumber = cargoDraft.serialNumber.trim()
    const cargoValue = cargoDraft.cargoValue.trim()

    if (isDuplicateSerial(serialNumber)) {
      chipDraftStatus.value = 'duplicated'
      await goToFirstError({ root: '[data-form-wizard-step]' })
      return false
    }

    const exists = await verifyChipNumber(serialNumber)
    if (!exists) {
      await goToFirstError({ root: '[data-form-wizard-step]' })
      return false
    }

    upsertCargoItem(serialNumber, cargoValue)
    cargoItemsError.value = undefined
    return true
  }

  /**
   * Add cargo: previous draft must be valid + chip must exist,
   * then clear the form for the next cargo item.
   */
  async function startNewCargo(): Promise<boolean> {
    if (isCheckingChip.value) return false

    const hasDraftContent =
      Boolean(cargoDraft.serialNumber.trim()) || Boolean(cargoDraft.cargoValue.trim())

    if (!hasDraftContent) {
      if (shipment.items.length === 0) {
        cargoItemsError.value = t('site.insurance.register.validation.cargoItemsRequired')
        validateAllCargoDraftFields()
        await goToFirstError({ root: '[data-form-wizard-step]' })
        return false
      }
      resetCargoDraft()
      return true
    }

    const saved = await saveCargoDraft()
    if (!saved) return false

    resetCargoDraft()
    return true
  }

  function editCargoItem(id: string) {
    const item = shipment.items.find((entry) => entry.id === id)
    if (!item) return

    editingCargoId.value = item.id
    cargoDraft.serialNumber = item.serialNumber
    cargoDraft.cargoValue = item.cargoValue
    chipDraftStatus.value = 'exists'
    for (const field of CARGO_DRAFT_FIELDS) {
      cargoDraftErrors[field] = undefined
      touchedCargoDraft[field] = false
    }
  }

  function removeCargoItem(id: string) {
    const index = shipment.items.findIndex((item) => item.id === id)
    if (index === -1) return

    shipment.items.splice(index, 1)
    if (editingCargoId.value === id) resetCargoDraft()
    if (cargoItemsError.value) validateCargoItems()
  }

  function setCargoValue(value: string | number) {
    cargoDraft.cargoValue = String(value).replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
  }

  function setDistanceKm(value: string | number) {
    shipment.distanceKm = String(value).replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
  }

  function selectProvider(id: number) {
    selectedProviderId.value = id
    providerSelectionError.value = undefined
  }

  async function loadProviders(force = false): Promise<boolean> {
    const queryKey = providersQueryKey.value
    if (!force && queryKey === lastProvidersQueryKey.value && providers.value.length > 0) {
      return true
    }

    providersLoading.value = true
    providersError.value = null

    try {
      const list = await getInsuranceService().listServiceProviders({
        distanceKm: shipment.distanceKm,
        totalPrice: totalCargoValue.value,
      })

      providers.value = list
      lastProvidersQueryKey.value = queryKey

      if (selectedProviderId.value != null) {
        const stillAvailable = list.some((provider) => provider.id === selectedProviderId.value)
        if (!stillAvailable) selectedProviderId.value = null
      }

      if (list.length === 1 && selectedProviderId.value == null) {
        selectedProviderId.value = list[0]!.id
      }

      return true
    } catch (error) {
      providers.value = []
      selectedProviderId.value = null
      lastProvidersQueryKey.value = ''
      providersError.value = normalizeApiError(error).message
      return false
    } finally {
      providersLoading.value = false
    }
  }

  function validateProviderSelection(): boolean {
    if (selectedProviderId.value == null) {
      providerSelectionError.value = t('site.insurance.register.validation.providerRequired')
      return false
    }
    providerSelectionError.value = undefined
    return true
  }

  async function validateCurrentStep(): Promise<boolean> {
    if (activeStep.value === 'customer') return validateAllCustomerFields()
    if (activeStep.value === 'shipment') return validateAllShipmentFields()
    if (activeStep.value === 'pricing') return validateProviderSelection()
    return true
  }

  async function next() {
    if (!(await validateCurrentStep())) {
      await goToFirstError({ root: '[data-form-wizard-step]' })
      return false
    }
    if (!isLastStep.value) currentStep.value += 1
    return true
  }

  function prev() {
    if (!isFirstStep.value) currentStep.value -= 1
  }

  watch(activeStep, (step) => {
    if (step === 'pricing') void loadProviders()
  })

  function setNationalId(value: string | number) {
    customer.nationalId = String(value).replace(/\D/g, '').slice(0, 14)
  }

  function touchCustomerField(field: keyof InsuranceCustomerFormValues) {
    touchedCustomer[field] = true
    validateCustomerField(field)
  }

  function touchCargoDraftField(field: keyof InsuranceCargoDraftValues) {
    touchedCargoDraft[field] = true
    validateCargoDraftField(field)
  }

  function touchShipmentTripField(field: InsuranceShipmentTripField) {
    touchedShipmentTrip[field] = true
    validateShipmentTripField(field)
  }

  return {
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
    providers,
    providersLoading,
    providersError,
    selectedProviderId,
    selectedProvider,
    providerSelectionError,
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
    selectProvider,
    loadProviders,
    saveCargoDraft,
    startNewCargo,
    editCargoItem,
    removeCargoItem,
    resetCargoDraft,
  }
}
