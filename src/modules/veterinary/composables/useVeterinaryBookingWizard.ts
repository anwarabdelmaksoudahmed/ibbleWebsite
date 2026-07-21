import { useInfiniteQuery, useQuery } from '@tanstack/vue-query'
import { normalizeApiError } from '@core/api/http/errors'
import { DEFAULT_COUNTRY_CODE } from '@shared/constants/country-codes'
import { goToFirstError } from '@shared/utils/go-to-first-error'
import {
  VETERINARY_BOOKING_STEPS,
  VETERINARY_DOCTOR_SORT_OPTIONS,
  type VeterinaryBookingStep,
  type VeterinaryDoctorSortId,
  type VeterinaryServiceTypeId,
} from '@modules/veterinary/constants/routes'
import { VETERINARY_QUERY_KEYS } from '@modules/veterinary/constants/query-keys'
import {
  veterinaryPaymentSchema,
  type VeterinaryPaymentField,
  type VeterinaryPaymentFormValues,
} from '@modules/veterinary/schemas/booking.schema'
import { getVeterinaryDoctorsService } from '@modules/veterinary/services/doctors.service'
import { getVeterinaryReservationsService } from '@modules/veterinary/services/reservations.service'
import type {
  VeterinaryAppointmentDay,
  VeterinaryAppointmentSlot,
  VeterinaryDoctor,
  VeterinaryWeekdayName,
} from '@modules/veterinary/types/internal.types'
import {
  filterAvailableSlots,
  generateDaySlots,
  getUpcomingAvailableDays,
} from '@modules/veterinary/utils/appointment-slots'
import { getDoctorPriceForService } from '@modules/veterinary/utils/doctor-mappers'

const DOCTORS_PAGE_SIZE = 10

function createEmptyPaymentForm(): VeterinaryPaymentFormValues {
  return {
    customerName: '',
    customerPhone: '',
    countryCode: DEFAULT_COUNTRY_CODE.apiCode,
    address: '',
    paymentMethod: '',
  }
}

export function useVeterinaryBookingWizard() {
  const { t, locale } = useI18n()
  const { user } = useAuth()

  const currentStep = ref(0)
  const serviceType = ref<VeterinaryServiceTypeId | ''>('')
  const selectedDoctor = ref<VeterinaryDoctor | null>(null)
  const selectedDay = ref<VeterinaryAppointmentDay | null>(null)
  const selectedSlot = ref<VeterinaryAppointmentSlot | null>(null)
  const appointmentView = ref<'days' | 'slots'>('days')

  const searchQuery = ref('')
  const cityFilter = ref('')
  const sortBy = ref<VeterinaryDoctorSortId>('default')

  const payment = reactive<VeterinaryPaymentFormValues>(createEmptyPaymentForm())
  const paymentErrors = reactive<Partial<Record<VeterinaryPaymentField, string>>>({})
  const touchedPayment = reactive<Partial<Record<VeterinaryPaymentField, boolean>>>({})

  const steps = computed(() =>
    VETERINARY_BOOKING_STEPS.map((key) => ({
      key,
      label: t(`site.veterinary.book.steps.${key}`),
    })),
  )

  const activeStep = computed<VeterinaryBookingStep>(
    () => VETERINARY_BOOKING_STEPS[currentStep.value] ?? 'serviceType',
  )

  const isFirstStep = computed(() => currentStep.value === 0)
  const isLastStep = computed(() => currentStep.value === VETERINARY_BOOKING_STEPS.length - 1)
  const requiresAddress = computed(() => serviceType.value === 'fieldVisit')

  const doctorsQueryParams = computed(() => {
    if (serviceType.value === 'clinic') {
      return { allow_clinic_examine: 1 as const, limit: DOCTORS_PAGE_SIZE }
    }
    if (serviceType.value === 'fieldVisit') {
      return { allow_outdoor_examine: 1 as const, limit: DOCTORS_PAGE_SIZE }
    }
    return null
  })

  const doctorsQuery = useInfiniteQuery({
    queryKey: computed(() =>
      VETERINARY_QUERY_KEYS.doctors({
        serviceType: serviceType.value,
      }),
    ),
    initialPageParam: 1,
    enabled: computed(() => import.meta.client && Boolean(doctorsQueryParams.value)),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    queryFn: ({ pageParam, signal }) => {
      const params = doctorsQueryParams.value
      if (!params) {
        return Promise.resolve({
          items: [],
          count: 0,
          totalPages: 1,
          currentPage: 1,
          itemsPerPage: DOCTORS_PAGE_SIZE,
        })
      }

      return getVeterinaryDoctorsService().listDoctors(
        { ...params, page: pageParam },
        { signal },
      )
    },
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
    retry: (failureCount, error) => {
      const status = normalizeApiError(error).statusCode
      if (status === 401 || status === 403) return false
      return failureCount < 2
    },
  })

  const allDoctors = computed(() =>
    doctorsQuery.data.value?.pages.flatMap((page) => page.items) ?? [],
  )

  const filteredDoctors = computed(() => {
    let items = [...allDoctors.value]
    const query = searchQuery.value.trim().toLowerCase()

    if (query) {
      items = items.filter((doctor) => {
        const haystack = [
          doctor.fullName,
          doctor.clinicName,
          doctor.clinicAddress,
          doctor.description,
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(query)
      })
    }

    if (cityFilter.value) {
      items = items.filter((doctor) => doctor.cityId === cityFilter.value)
    }

    switch (sortBy.value) {
      case 'priceAsc':
        items.sort(
          (a, b) =>
            getDoctorPriceForService(a, serviceType.value as VeterinaryServiceTypeId) -
            getDoctorPriceForService(b, serviceType.value as VeterinaryServiceTypeId),
        )
        break
      case 'priceDesc':
        items.sort(
          (a, b) =>
            getDoctorPriceForService(b, serviceType.value as VeterinaryServiceTypeId) -
            getDoctorPriceForService(a, serviceType.value as VeterinaryServiceTypeId),
        )
        break
      case 'nameAsc':
        items.sort((a, b) => a.fullName.localeCompare(b.fullName, locale.value))
        break
      default:
        break
    }

    return items
  })

  const cityOptions = computed(() => {
    const map = new Map<string, string>()

    for (const doctor of allDoctors.value) {
      if (!doctor.cityId) continue
      map.set(doctor.cityId, doctor.clinicAddress || doctor.cityId)
    }

    return [
      { value: '', label: t('site.veterinary.book.doctor.allCities') },
      ...Array.from(map.entries()).map(([value, label]) => ({ value, label })),
    ]
  })

  const sortOptions = computed(() =>
    VETERINARY_DOCTOR_SORT_OPTIONS.map((value) => ({
      value,
      label: t(`site.veterinary.book.doctor.sort.${value}`),
    })),
  )

  const upcomingDays = computed(() => {
    if (!selectedDoctor.value) return []
    return getUpcomingAvailableDays(selectedDoctor.value)
  })

  const reservedTimesQuery = useQuery({
    queryKey: computed(() =>
      selectedDoctor.value && selectedDay.value
        ? VETERINARY_QUERY_KEYS.reservedTimes(
            selectedDoctor.value.id,
            selectedDay.value.day,
            selectedDay.value.date,
          )
        : ['veterinary', 'reserved-times', 'idle'],
    ),
    enabled: computed(
      () =>
        import.meta.client &&
        appointmentView.value === 'slots' &&
        Boolean(selectedDoctor.value && selectedDay.value),
    ),
    staleTime: 0,
    refetchOnWindowFocus: false,
    queryFn: ({ signal }) => {
      const doctor = selectedDoctor.value
      const day = selectedDay.value
      if (!doctor || !day) {
        return Promise.resolve({ data: [], canReserve: true })
      }

      return getVeterinaryReservationsService().listReservedTimes(
        doctor.id,
        { day: day.day, date: day.date },
        { signal },
      )
    },
  })

  const availableSlots = computed(() => {
    const doctor = selectedDoctor.value
    const day = selectedDay.value
    if (!doctor || !day) return []

    const generated = generateDaySlots(doctor, day.day, locale.value)
    const reserved = reservedTimesQuery.data.value

    if (reserved?.canReserve === false) return []

    return filterAvailableSlots(generated, reserved?.data ?? [])
  })

  function prefillPaymentFromUser() {
    if (!user.value) return

    if (!payment.customerName.trim()) payment.customerName = user.value.name ?? ''
    if (!payment.customerPhone.trim()) payment.customerPhone = user.value.phone ?? ''
    if (!payment.countryCode.trim()) {
      payment.countryCode = user.value.countryCode || DEFAULT_COUNTRY_CODE.apiCode
    }
  }

  watch(user, prefillPaymentFromUser, { immediate: true })

  function validatePaymentField(field: VeterinaryPaymentField) {
    const result = veterinaryPaymentSchema.safeParse({
      ...payment,
      requiresAddress: requiresAddress.value,
    })

    if (result.success) {
      paymentErrors[field] = undefined
      return
    }

    const issue = result.error.issues.find((entry) => entry.path[0] === field)
    paymentErrors[field] = issue ? t(issue.message) : undefined
  }

  function validatePaymentForm(): boolean {
    ;(['customerName', 'customerPhone', 'countryCode', 'address', 'paymentMethod'] as const).forEach(
      (field) => {
        touchedPayment[field] = true
      },
    )

    const result = veterinaryPaymentSchema.safeParse({
      ...payment,
      requiresAddress: requiresAddress.value,
    })

    for (const field of Object.keys(paymentErrors) as VeterinaryPaymentField[]) {
      paymentErrors[field] = undefined
    }

    if (result.success) return true

    for (const issue of result.error.issues) {
      const field = issue.path[0] as VeterinaryPaymentField | undefined
      if (field) paymentErrors[field] = t(issue.message)
    }

    return false
  }

  watch(
    () => [payment.customerName, payment.customerPhone, payment.countryCode, payment.address, payment.paymentMethod],
    () => {
      for (const field of Object.keys(touchedPayment) as VeterinaryPaymentField[]) {
        if (touchedPayment[field]) validatePaymentField(field)
      }
    },
    { deep: true },
  )

  async function validateCurrentStep(): Promise<boolean> {
    switch (activeStep.value) {
      case 'serviceType':
        return Boolean(serviceType.value)
      case 'doctor':
        return Boolean(selectedDoctor.value)
      case 'appointment':
        return Boolean(selectedDay.value && selectedSlot.value)
      case 'payment':
        return validatePaymentForm()
      default:
        return false
    }
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
    if (appointmentView.value === 'slots' && activeStep.value === 'appointment') {
      appointmentView.value = 'days'
      selectedSlot.value = null
      return
    }

    if (!isFirstStep.value) currentStep.value -= 1
  }

  function goToStep(stepIndex: number) {
    currentStep.value = Math.max(0, Math.min(stepIndex, VETERINARY_BOOKING_STEPS.length - 1))
  }

  function selectServiceType(type: VeterinaryServiceTypeId) {
    if (serviceType.value !== type) {
      serviceType.value = type
      selectedDoctor.value = null
      selectedDay.value = null
      selectedSlot.value = null
      appointmentView.value = 'days'
    }

    goToStep(1)
  }

  function selectDoctor(doctor: VeterinaryDoctor) {
    selectedDoctor.value = doctor
    selectedDay.value = null
    selectedSlot.value = null
    appointmentView.value = 'days'
    goToStep(2)
  }

  async function openDaySlots(day: VeterinaryAppointmentDay) {
    selectedDay.value = day
    selectedSlot.value = null
    appointmentView.value = 'slots'
    await reservedTimesQuery.refetch()
  }

  function selectSlot(slot: VeterinaryAppointmentSlot) {
    selectedSlot.value = slot
    goToStep(3)
  }

  function touchPaymentField(field: VeterinaryPaymentField) {
    touchedPayment[field] = true
    validatePaymentField(field)
  }

  function setPaymentMethod(value: VeterinaryPaymentFormValues['paymentMethod']) {
    payment.paymentMethod = value
    touchedPayment.paymentMethod = true
    validatePaymentField('paymentMethod')
  }

  function setPaymentField<K extends keyof VeterinaryPaymentFormValues>(
    field: K,
    value: VeterinaryPaymentFormValues[K],
  ) {
    payment[field] = value
  }

  async function loadMoreDoctors() {
    if (!doctorsQuery.hasNextPage.value || doctorsQuery.isFetchingNextPage.value) return
    await doctorsQuery.fetchNextPage()
  }

  return {
    steps,
    currentStep,
    activeStep,
    serviceType,
    selectedDoctor,
    selectedDay,
    selectedSlot,
    appointmentView,
    upcomingDays,
    availableSlots,
    searchQuery,
    cityFilter,
    sortBy,
    sortOptions,
    cityOptions,
    filteredDoctors,
    doctorsLoading: computed(
      () =>
        doctorsQuery.isPending.value ||
        (doctorsQuery.isFetching.value && !doctorsQuery.isFetched.value),
    ),
    doctorsLoadingMore: computed(() => doctorsQuery.isFetchingNextPage.value),
    doctorsError: computed(() => doctorsQuery.isError.value),
    doctorsHasMore: computed(() => doctorsQuery.hasNextPage.value ?? false),
    reservedTimesLoading: computed(() => reservedTimesQuery.isFetching.value),
    reservedTimesError: computed(() => reservedTimesQuery.isError.value),
    canReserveDay: computed(() => reservedTimesQuery.data.value?.canReserve !== false),
    payment,
    paymentErrors,
    requiresAddress,
    isFirstStep,
    isLastStep,
    next,
    prev,
    goToStep,
    selectServiceType,
    selectDoctor,
    openDaySlots,
    selectSlot,
    touchPaymentField,
    setPaymentMethod,
    setPaymentField,
    loadMoreDoctors,
    refetchDoctors: doctorsQuery.refetch,
    refetchReservedTimes: reservedTimesQuery.refetch,
  }
}
