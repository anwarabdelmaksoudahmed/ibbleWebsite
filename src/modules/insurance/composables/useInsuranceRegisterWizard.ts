import { DEFAULT_COUNTRY_CODE } from '@shared/constants/country-codes'
import {
  insuranceCustomerSchema,
  type InsuranceCustomerFormValues,
} from '@modules/insurance/schemas/customer.schema'
import {
  INSURANCE_REGISTER_STEPS,
  type InsuranceRegisterStep,
} from '@modules/insurance/constants/routes'

const CUSTOMER_FIELDS = [
  'nationalId',
  'name',
  'phone',
  'countryCode',
  'email',
  'address',
] as const satisfies readonly (keyof InsuranceCustomerFormValues)[]

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

export function useInsuranceRegisterWizard() {
  const { t } = useI18n()
  const { user } = useAuth()

  const currentStep = ref(0)
  const customer = reactive<InsuranceCustomerFormValues>(createEmptyCustomerForm())
  const customerErrors = reactive<Partial<Record<keyof InsuranceCustomerFormValues, string>>>({})
  const touchedCustomer = reactive<Partial<Record<keyof InsuranceCustomerFormValues, boolean>>>({})

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

  function validateCurrentStep(): boolean {
    if (activeStep.value !== 'customer') return true
    return validateAllCustomerFields()
  }

  function next() {
    if (!validateCurrentStep()) return false
    if (!isLastStep.value) currentStep.value += 1
    return true
  }

  function prev() {
    if (!isFirstStep.value) currentStep.value -= 1
  }

  function setNationalId(value: string | number) {
    customer.nationalId = String(value).replace(/\D/g, '').slice(0, 14)
  }

  function touchCustomerField(field: keyof InsuranceCustomerFormValues) {
    touchedCustomer[field] = true
    validateCustomerField(field)
  }

  return {
    steps,
    currentStep,
    activeStep,
    customer,
    customerErrors,
    isFirstStep,
    isLastStep,
    next,
    prev,
    setNationalId,
    touchCustomerField,
  }
}
