import { APP_CONFIG } from '@shared/constants/app-config'
import { DEFAULT_COUNTRY_CODE } from '@shared/constants/country-codes'
import { debounce } from '@shared/utils/debounce'
import { goToFirstError } from '@shared/utils/go-to-first-error'
import type { PlaceSelection } from '@shared/maps/types'
import {
  TRANSPORT_REGISTER_STEPS,
  type TransportRegisterStep,
} from '@modules/transport/constants/routes'
import {
  transportDeliverySchema,
  transportPaymentSchema,
  transportShipmentTypeSchema,
  type TransportDeliveryField,
  type TransportDeliveryFormValues,
} from '@modules/transport/schemas/register.schema'
import {
  clearRegisterDraft,
  readRegisterDraft,
  saveRegisterDraft,
  type TransportRegisterDraft,
} from '@modules/transport/utils/register-draft-storage'
import { readLatestTripPaymentSnapshot } from '@modules/transport/utils/trip-payment-snapshot'

const DELIVERY_FIELDS = [
  'name',
  'phone',
  'countryCode',
  'transportDate',
  'transportTime',
  'origin',
  'destination',
  'distanceKm',
  'originLat',
  'originLng',
  'destinationLat',
  'destinationLng',
] as const satisfies readonly TransportDeliveryField[]

function createEmptyDeliveryForm(): TransportDeliveryFormValues {
  return {
    name: '',
    phone: '',
    countryCode: DEFAULT_COUNTRY_CODE.apiCode,
    transportDate: '',
    transportTime: '',
    origin: '',
    destination: '',
    distanceKm: '',
    originLat: null,
    originLng: null,
    destinationLat: null,
    destinationLng: null,
  }
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useTransportRegisterWizard() {
  const { t } = useI18n()
  const { user } = useAuth()

  const currentStep = ref(0)
  const delivery = reactive<TransportDeliveryFormValues>(createEmptyDeliveryForm())
  const deliveryErrors = reactive<Partial<Record<TransportDeliveryField, string>>>({})
  const touchedDelivery = reactive<Partial<Record<TransportDeliveryField, boolean>>>({})

  const shipmentTypeId = ref('')
  const shipmentTypeError = ref<string | undefined>()
  const touchedShipmentType = ref(false)

  const termsAccepted = ref(false)
  const termsError = ref<string | undefined>()
  const touchedTerms = ref(false)

  const steps = computed(() =>
    TRANSPORT_REGISTER_STEPS.map((key) => ({
      key,
      label: t(`site.transport.register.steps.${key}`),
    })),
  )

  const activeStep = computed<TransportRegisterStep>(
    () => TRANSPORT_REGISTER_STEPS[currentStep.value] ?? 'delivery',
  )

  const isFirstStep = computed(() => currentStep.value === 0)
  const isLastStep = computed(() => currentStep.value === TRANSPORT_REGISTER_STEPS.length - 1)

  function prefillFromUser() {
    if (!user.value) return

    if (!delivery.name.trim()) delivery.name = user.value.name ?? ''
    if (!delivery.phone.trim()) delivery.phone = user.value.phone ?? ''
    if (!delivery.countryCode.trim()) {
      delivery.countryCode = user.value.countryCode || DEFAULT_COUNTRY_CODE.apiCode
    }
  }

  function applyDraft(draft: TransportRegisterDraft) {
    // Never restore the payment step from draft — payment only opens after driver accept.
    const paymentIndex = TRANSPORT_REGISTER_STEPS.indexOf('payment')
    const maxFormStep = Math.max(0, paymentIndex - 1)
    currentStep.value = Math.min(draft.currentStep, maxFormStep)
    Object.assign(delivery, draft.delivery)
    shipmentTypeId.value = draft.shipmentTypeId
    termsAccepted.value = false

    const todayLocal = formatLocalDate(new Date())
    if (delivery.transportDate && delivery.transportDate < todayLocal) {
      delivery.transportDate = ''
    }
  }

  const paymentTripId = ref('')

  function goToPaymentStep(tripId: string) {
    paymentTripId.value = String(tripId || '').trim()
    const paymentIndex = TRANSPORT_REGISTER_STEPS.indexOf('payment')
    if (paymentIndex >= 0) currentStep.value = paymentIndex
  }

  function clearPaymentStep() {
    paymentTripId.value = ''
  }

  /** Cancel payment flow and restart the register wizard from delivery. */
  function resetToStart() {
    currentStep.value = 0
    paymentTripId.value = ''
    Object.assign(delivery, createEmptyDeliveryForm())
    shipmentTypeId.value = ''
    shipmentTypeError.value = undefined
    touchedShipmentType.value = false
    termsAccepted.value = false
    termsError.value = undefined
    touchedTerms.value = false
    for (const field of DELIVERY_FIELDS) {
      deliveryErrors[field] = undefined
      touchedDelivery[field] = false
    }
    clearPersistedDraft()
    prefillFromUser()
  }

  if (import.meta.client) {
    const draft = readRegisterDraft()
    if (draft) applyDraft(draft)

    const pendingPayment = readLatestTripPaymentSnapshot()
    if (pendingPayment) {
      goToPaymentStep(pendingPayment.tripId)
    }
  }

  function buildDraftSnapshot(): Omit<TransportRegisterDraft, 'version' | 'savedAt'> {
    const paymentIndex = TRANSPORT_REGISTER_STEPS.indexOf('payment')
    const maxFormStep = Math.max(0, paymentIndex - 1)
    return {
      currentStep: Math.min(currentStep.value, maxFormStep),
      delivery: { ...delivery },
      shipmentTypeId: shipmentTypeId.value,
      termsAccepted: false,
    }
  }

  const persistDraft = debounce(() => {
    saveRegisterDraft(buildDraftSnapshot())
  }, APP_CONFIG.DEBOUNCE_MS)

  function flushDraftPersistence() {
    persistDraft.flush()
  }

  function clearPersistedDraft() {
    persistDraft.cancel()
    clearRegisterDraft()
  }

  onMounted(prefillFromUser)
  onBeforeUnmount(() => {
    flushDraftPersistence()
    persistDraft.cancel()
  })

  if (import.meta.client) {
    useEventListener(window, 'pagehide', flushDraftPersistence)
  }

  watch(user, prefillFromUser)

  watch(
    [currentStep, delivery, shipmentTypeId],
    () => persistDraft(),
    { deep: true },
  )

  function validateDeliveryField(field: TransportDeliveryField) {
    if (field === 'origin') {
      const text = transportDeliverySchema.shape.origin.safeParse(delivery.origin)
      if (!text.success) {
        deliveryErrors.origin = t(text.error.issues[0]!.message)
        return
      }
      if (delivery.originLat == null || delivery.originLng == null) {
        deliveryErrors.origin = t('site.transport.register.validation.locationRequired')
        return
      }
      deliveryErrors.origin = undefined
      return
    }

    if (field === 'destination') {
      const text = transportDeliverySchema.shape.destination.safeParse(delivery.destination)
      if (!text.success) {
        deliveryErrors.destination = t(text.error.issues[0]!.message)
        return
      }
      if (delivery.destinationLat == null || delivery.destinationLng == null) {
        deliveryErrors.destination = t('site.transport.register.validation.locationRequired')
        return
      }
      deliveryErrors.destination = undefined
      return
    }

    if (
      field === 'originLat' ||
      field === 'originLng' ||
      field === 'destinationLat' ||
      field === 'destinationLng'
    ) {
      return
    }

    const result = transportDeliverySchema.shape[field].safeParse(delivery[field])
    deliveryErrors[field] = result.success ? undefined : t(result.error.issues[0]!.message)
  }

  function touchAllDeliveryFields() {
    for (const field of DELIVERY_FIELDS) {
      touchedDelivery[field] = true
    }
  }

  function validateAllDeliveryFields(): boolean {
    touchAllDeliveryFields()
    for (const field of DELIVERY_FIELDS) {
      validateDeliveryField(field)
    }
    return !DELIVERY_FIELDS.some((field) => deliveryErrors[field])
  }

  for (const field of DELIVERY_FIELDS) {
    watch(
      () => delivery[field],
      () => {
        if (touchedDelivery[field] || deliveryErrors[field]) {
          validateDeliveryField(field)
        }
      },
    )
  }

  function validateShipmentType(allowedIds?: readonly string[]): boolean {
    const result = transportShipmentTypeSchema.safeParse({
      shipmentTypeId: shipmentTypeId.value,
    })

    if (!result.success) {
      shipmentTypeError.value = t(result.error.issues[0]!.message)
      return false
    }

    if (allowedIds && !allowedIds.includes(result.data.shipmentTypeId)) {
      shipmentTypeError.value = t('site.transport.register.validation.shipmentTypeRequired')
      return false
    }

    shipmentTypeError.value = undefined
    return true
  }

  function validateTerms(): boolean {
    const result = transportPaymentSchema.safeParse({
      termsAccepted: termsAccepted.value,
    })
    termsError.value = result.success ? undefined : t(result.error.issues[0]!.message)
    return result.success
  }

  watch(shipmentTypeId, () => {
    if (touchedShipmentType.value || shipmentTypeError.value) {
      validateShipmentType()
    }
  })

  watch(termsAccepted, () => {
    if (touchedTerms.value || termsError.value) {
      validateTerms()
    }
  })

  async function validateCurrentStep(allowedShipmentTypeIds?: readonly string[]): Promise<boolean> {
    switch (activeStep.value) {
      case 'delivery':
        return validateAllDeliveryFields()
      case 'shipmentType':
        touchedShipmentType.value = true
        return validateShipmentType(allowedShipmentTypeIds)
      case 'payment':
        // Payment step is post-accept; no form validation here.
        return Boolean(paymentTripId.value)
      default:
        return false
    }
  }

  async function next(
    allowedShipmentTypeIds?: readonly string[],
    options?: { advance?: boolean },
  ) {
    if (!(await validateCurrentStep(allowedShipmentTypeIds))) {
      await goToFirstError({ root: '[data-form-wizard-step]' })
      return false
    }
    const shouldAdvance = options?.advance !== false
    if (shouldAdvance && !isLastStep.value) currentStep.value += 1
    return true
  }

  function prev() {
    if (!isFirstStep.value) currentStep.value -= 1
  }

  function touchDeliveryField(field: TransportDeliveryField) {
    touchedDelivery[field] = true
    validateDeliveryField(field)
  }

  function setDistanceKm(value: string | number) {
    delivery.distanceKm = String(value)
  }

  function setOriginPlace(place: PlaceSelection | null) {
    delivery.originLat = place?.location.lat ?? null
    delivery.originLng = place?.location.lng ?? null
    if (touchedDelivery.origin || deliveryErrors.origin) {
      validateDeliveryField('origin')
    }
  }

  function setDestinationPlace(place: PlaceSelection | null) {
    delivery.destinationLat = place?.location.lat ?? null
    delivery.destinationLng = place?.location.lng ?? null
    if (touchedDelivery.destination || deliveryErrors.destination) {
      validateDeliveryField('destination')
    }
  }

  function selectShipmentType(id: string) {
    shipmentTypeId.value = id
    touchedShipmentType.value = true
    validateShipmentType()
  }

  function setTermsAccepted(value: boolean) {
    termsAccepted.value = value
    touchedTerms.value = true
    validateTerms()
  }

  return {
    steps,
    currentStep,
    activeStep,
    delivery,
    deliveryErrors,
    shipmentTypeId,
    shipmentTypeError,
    termsAccepted,
    termsError,
    paymentTripId,
    isFirstStep,
    isLastStep,
    next,
    prev,
    touchDeliveryField,
    setDistanceKm,
    setOriginPlace,
    setDestinationPlace,
    selectShipmentType,
    setTermsAccepted,
    goToPaymentStep,
    clearPaymentStep,
    resetToStart,
    clearPersistedDraft,
  }
}
