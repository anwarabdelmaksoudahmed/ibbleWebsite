import { useQuery } from '@tanstack/vue-query'
import { getGeoService } from '@modules/checkout/services/geo.service'
import { CHECKOUT_QUERY_KEYS } from '@modules/checkout/constants/query-keys'
import type { CheckoutCity, CheckoutCountry } from '@modules/checkout/types'

export function useCheckoutGeo() {
  const countriesQuery = useQuery({
    queryKey: CHECKOUT_QUERY_KEYS.countries(),
    queryFn: () => getGeoService().listCountries(),
    enabled: computed(() => import.meta.client),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  })

  const citiesQuery = useQuery({
    queryKey: CHECKOUT_QUERY_KEYS.cities(),
    queryFn: () => getGeoService().listCities(),
    enabled: computed(() => import.meta.client),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  })

  const countries = computed<CheckoutCountry[]>(() => countriesQuery.data.value ?? [])
  const cities = computed<CheckoutCity[]>(() => citiesQuery.data.value ?? [])

  function citiesForCountry(countryId: string): CheckoutCity[] {
    if (!countryId) return []
    return cities.value.filter((city) => city.countryId === countryId)
  }

  return {
    countries,
    cities,
    citiesForCountry,
    isCountriesLoading: computed(() => countriesQuery.isPending.value),
    isCitiesLoading: computed(() => citiesQuery.isPending.value),
    refetchCountries: countriesQuery.refetch,
    refetchCities: citiesQuery.refetch,
  }
}
