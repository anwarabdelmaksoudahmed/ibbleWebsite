import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { normalizeApiError } from '@core/api/http/errors'
import { getAddressesService } from '@modules/checkout/services/addresses.service'
import { CHECKOUT_QUERY_KEYS } from '@modules/checkout/constants/query-keys'
import type { AddressFormInput, CustomerAddress } from '@modules/checkout/types'
import { ROUTES } from '@shared/constants/routes'

export function useCheckoutAddresses() {
  const { t } = useI18n()
  const toast = useToast()
  const { handleError } = useApi()
  const queryClient = useQueryClient()
  const localePath = useLocalePath()
  const { authenticated, isAuthenticated } = useAuth()
  const authSessionReady = useAuthSessionReady()

  const addressesQuery = useQuery({
    queryKey: CHECKOUT_QUERY_KEYS.addresses(),
    queryFn: () => getAddressesService().list(),
    enabled: computed(() => import.meta.client && authSessionReady.value && authenticated.value),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const status = normalizeApiError(error).statusCode
      if (status === 401 || status === 403) return false
      return failureCount < 2
    },
  })

  const addresses = computed<CustomerAddress[]>(() => addressesQuery.data.value ?? [])

  const selectedAddressId = ref<string | null>(null)

  watch(
    addresses,
    (list) => {
      if (!list.length) {
        selectedAddressId.value = null
        return
      }
      const stillSelected = list.some((item) => item.id === selectedAddressId.value)
      if (stillSelected) return
      const preferred = list.find((item) => item.isDefault) ?? list[0]
      selectedAddressId.value = preferred?.id ?? null
    },
    { immediate: true },
  )

  const selectedAddress = computed(
    () => addresses.value.find((item) => item.id === selectedAddressId.value) ?? null,
  )

  async function ensureAuthenticated(): Promise<boolean> {
    if (isAuthenticated()) return true
    toast.warning(t('site.commerce.authRequired'))
    await navigateTo(localePath(ROUTES.AUTH.LOGIN))
    return false
  }

  const createMutation = useMutation({
    mutationFn: (input: AddressFormInput) => getAddressesService().create(input),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: CHECKOUT_QUERY_KEYS.addresses() })
      selectedAddressId.value = created.id
      toast.success(t('site.commerce.checkout.addressCreateSuccess'))
    },
    onError: (error) => handleError(error),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: AddressFormInput }) =>
      getAddressesService().update(id, input),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: CHECKOUT_QUERY_KEYS.addresses() })
      selectedAddressId.value = updated.id
      toast.success(t('site.commerce.checkout.addressUpdateSuccess'))
    },
    onError: (error) => handleError(error),
  })

  async function createAddress(input: AddressFormInput): Promise<boolean> {
    if (!(await ensureAuthenticated())) return false
    await createMutation.mutateAsync(input)
    return true
  }

  async function updateAddress(id: string, input: AddressFormInput): Promise<boolean> {
    if (!(await ensureAuthenticated())) return false
    await updateMutation.mutateAsync({ id, input })
    return true
  }

  function selectAddress(id: string) {
    selectedAddressId.value = id
  }

  return {
    addresses,
    selectedAddressId,
    selectedAddress,
    isLoading: computed(
      () =>
        authSessionReady.value &&
        authenticated.value &&
        (addressesQuery.isPending.value ||
          (addressesQuery.isFetching.value && !addressesQuery.isFetched.value)),
    ),
    isFetched: computed(() => addressesQuery.isFetched.value),
    isError: computed(() => addressesQuery.isError.value),
    isSaving: computed(() => createMutation.isPending.value || updateMutation.isPending.value),
    selectAddress,
    createAddress,
    updateAddress,
    refetch: addressesQuery.refetch,
  }
}
