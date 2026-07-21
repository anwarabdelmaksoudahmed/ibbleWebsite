import { normalizeApiError } from '@core/api/http/errors'
import { DEFAULT_COUNTRY_CODE } from '@shared/constants/country-codes'
import { sanitizeNationalIdInput } from '@shared/utils/national-id'
import { goToFirstError } from '@shared/utils/go-to-first-error'
import {
  JOIN_COMMISSION_RATES,
  JOIN_SERVICE_PROVIDER_TYPES,
  type JoinProviderType,
  type JoinService,
} from '@modules/join/constants'
import { JOIN_SCHEMAS } from '@modules/join/schemas/join.schema'
import { getJoinService } from '@modules/join/services/join.service'
import type { JoinApiResponse } from '@modules/join/types'

/** Union of every field used across the five provider forms. */
function createEmptyForm() {
  return {
    ownerName: '',
    fullName: '',
    companyName: '',
    companyAddress: '',
    clinicName: '',
    email: '',
    phone: '',
    countryCode: DEFAULT_COUNTRY_CODE.apiCode,
    otherPhone: '',
    nationalId: '',
    storeTypeId: '',
    storeNameAr: '',
    storeNameEn: '',
    cityId: '',
    address: '',
    termsAccepted: false,
  }
}

export type JoinFormFields = ReturnType<typeof createEmptyForm>
export type JoinFormField = keyof JoinFormFields

/** API (snake_case) field → form field, per provider type where names collide. */
const API_NAME_FIELD: Record<JoinProviderType, JoinFormField> = {
  merchant: 'ownerName',
  driver: 'fullName',
  company: 'companyName',
  doctor: 'fullName',
  clinic: 'clinicName',
}

const API_FIELD_MAP: Record<string, JoinFormField> = {
  phone: 'phone',
  country_code: 'countryCode',
  other_phone: 'otherPhone',
  national_id: 'nationalId',
  email: 'email',
  store_type_id: 'storeTypeId',
  store_name_ar: 'storeNameAr',
  store_name_en: 'storeNameEn',
  city_id: 'cityId',
  address: 'address',
  owner_name: 'ownerName',
  commission_approved: 'termsAccepted',
}

export function useJoinForm() {
  const { t } = useI18n()
  const toast = useToast()
  const { user } = useAuth()

  const service = ref<JoinService | null>(null)
  const providerType = ref<JoinProviderType | null>(null)

  const form = reactive(createEmptyForm())
  const touched = reactive<Partial<Record<JoinFormField, boolean>>>({})
  const fieldErrors = reactive<Partial<Record<JoinFormField, string>>>({})
  const formError = ref('')
  const submitting = ref(false)
  const submitted = ref(false)

  function applyUserDefaults() {
    const account = user.value
    if (!account) return

    if (!form.ownerName.trim() && account.name) form.ownerName = account.name
    if (!form.fullName.trim() && account.name) form.fullName = account.name
    if (!form.email.trim() && account.email) form.email = account.email
    if (!form.phone.trim() && account.phone) {
      form.phone = account.phone
      if (account.countryCode) form.countryCode = account.countryCode
    }
    if (!form.nationalId.trim() && account.nationalId) {
      form.nationalId = sanitizeNationalIdInput(account.nationalId)
    }
  }

  watch(user, applyUserDefaults, { immediate: true })

  const providerTypes = computed<readonly JoinProviderType[]>(() =>
    service.value ? JOIN_SERVICE_PROVIDER_TYPES[service.value] : [],
  )

  const commissionRate = computed(() =>
    providerType.value ? (JOIN_COMMISSION_RATES[providerType.value] ?? null) : null,
  )

  const activeSchema = computed(() =>
    providerType.value ? JOIN_SCHEMAS[providerType.value] : null,
  )

  function clearValidationState() {
    formError.value = ''
    for (const key of Object.keys(fieldErrors) as JoinFormField[]) {
      delete fieldErrors[key]
    }
    for (const key of Object.keys(touched) as JoinFormField[]) {
      delete touched[key]
    }
  }

  function selectService(next: JoinService) {
    if (service.value === next) return
    service.value = next
    // Auto-select when the service has a single provider type (marketplace).
    const types = JOIN_SERVICE_PROVIDER_TYPES[next]
    providerType.value = types.length === 1 ? (types[0] ?? null) : null
    clearValidationState()
  }

  function selectProviderType(next: JoinProviderType) {
    if (providerType.value === next) return
    providerType.value = next
    clearValidationState()
  }

  function setNationalId(value: string | number) {
    form.nationalId = sanitizeNationalIdInput(value)
    if (touched.nationalId) validateField('nationalId')
  }

  function validateField(field: JoinFormField) {
    if (!activeSchema.value) return
    touched[field] = true
    fieldErrors[field] = ''

    const validation = activeSchema.value.safeParse(form)
    if (!validation.success) {
      const issue = validation.error.issues.find((item) => String(item.path[0]) === field)
      if (issue) fieldErrors[field] = t(issue.message)
    }
  }

  function validateAll(): boolean {
    if (!activeSchema.value) return false

    formError.value = ''
    const validation = activeSchema.value.safeParse(form)
    if (validation.success) return true

    validation.error.issues.forEach((issue) => {
      const field = String(issue.path[0] ?? '') as JoinFormField
      if (field && !fieldErrors[field]) {
        touched[field] = true
        fieldErrors[field] = t(issue.message)
      }
    })
    return false
  }

  function submitRequest(): Promise<JoinApiResponse> {
    const joinService = getJoinService()

    switch (providerType.value) {
      case 'merchant':
        return joinService.join({
          ownerName: form.ownerName,
          phone: form.phone,
          countryCode: form.countryCode,
          nationalId: form.nationalId,
          storeTypeId: form.storeTypeId,
          storeNameAr: form.storeNameAr,
          storeNameEn: form.storeNameEn,
          cityId: form.cityId,
          address: form.address,
        })
      case 'driver':
        return joinService.joinDriver({
          fullName: form.fullName,
          phone: form.phone,
          countryCode: form.countryCode,
          nationalId: form.nationalId,
          termsAccepted: form.termsAccepted,
        })
      case 'company':
        return joinService.joinCompany({
          companyName: form.companyName,
          companyAddress: form.companyAddress,
          ownerName: form.ownerName,
          phone: form.phone,
          countryCode: form.countryCode,
          nationalId: form.nationalId,
          termsAccepted: form.termsAccepted,
        })
      case 'doctor':
        return joinService.joinDoctor({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          countryCode: form.countryCode,
          otherPhone: form.otherPhone,
          nationalId: form.nationalId,
          termsAccepted: form.termsAccepted,
        })
      case 'clinic':
        return joinService.joinClinic({
          clinicName: form.clinicName,
          ownerName: form.ownerName,
          email: form.email,
          phone: form.phone,
          countryCode: form.countryCode,
          otherPhone: form.otherPhone,
          nationalId: form.nationalId,
          termsAccepted: form.termsAccepted,
        })
      default:
        return Promise.reject(new Error('No provider type selected'))
    }
  }

  function applyApiFieldErrors(errors: Record<string, string[]>) {
    Object.entries(errors).forEach(([apiField, messages]) => {
      const message = messages.find(Boolean)
      if (!message) return

      const field =
        apiField === 'name' && providerType.value
          ? API_NAME_FIELD[providerType.value]
          : API_FIELD_MAP[apiField]

      if (field) {
        touched[field] = true
        fieldErrors[field] = message
      }
    })
  }

  async function handleSubmit() {
    if (!providerType.value || submitting.value) return

    if (!validateAll()) {
      await goToFirstError({ root: '[data-join-form]' })
      return
    }

    submitting.value = true
    try {
      await submitRequest()
      submitted.value = true
      toast.success(t('join.success.toast'))
    } catch (error) {
      const apiError = normalizeApiError(error)
      if (apiError.errors) applyApiFieldErrors(apiError.errors)
      formError.value = apiError.statusCode >= 500 ? t('errors.generic') : apiError.message
      await goToFirstError({ root: '[data-join-form]' })
    } finally {
      submitting.value = false
    }
  }

  function reset() {
    Object.assign(form, createEmptyForm())
    service.value = null
    providerType.value = null
    submitted.value = false
    clearValidationState()
    applyUserDefaults()
  }

  return {
    service,
    providerType,
    providerTypes,
    commissionRate,
    form,
    fieldErrors,
    formError,
    submitting,
    submitted,
    selectService,
    selectProviderType,
    setNationalId,
    validateField,
    handleSubmit,
    reset,
  }
}
