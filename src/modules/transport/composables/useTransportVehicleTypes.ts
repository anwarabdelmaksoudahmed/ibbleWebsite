import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { normalizeApiError } from '@core/api/http/errors'
import { TRANSPORT_QUERY_KEYS } from '@modules/transport/constants/query-keys'
import { getTransportTripsService } from '@modules/transport/services/trips.service'
import type { TransportVehicleType } from '@modules/transport/types'

/**
 * Active allowed vehicle types for the register shipment-type step.
 * Localized names come from API translations matching the current locale.
 */
export function useTransportVehicleTypes(enabled: MaybeRefOrGetter<boolean> = true) {
  const { locale } = useI18n()
  const isEnabled = computed(() => import.meta.client && toValue(enabled))

  const query = useQuery({
    queryKey: computed(() => TRANSPORT_QUERY_KEYS.vehicleTypes(locale.value)),
    queryFn: ({ signal }) =>
      getTransportTripsService().listAllowedVehicleTypes(
        { status: 1 },
        { signal, locale: locale.value },
      ),
    enabled: isEnabled,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const code = normalizeApiError(error).statusCode
      if (code === 401 || code === 403) return false
      return failureCount < 2
    },
  })

  return {
    vehicleTypes: computed<TransportVehicleType[]>(() => query.data.value ?? []),
    isLoading: computed(() => isEnabled.value && query.isPending.value),
    isError: computed(() => isEnabled.value && query.isError.value),
    errorMessage: computed(() =>
      query.error.value ? normalizeApiError(query.error.value).message : '',
    ),
    refetch: query.refetch,
  }
}
