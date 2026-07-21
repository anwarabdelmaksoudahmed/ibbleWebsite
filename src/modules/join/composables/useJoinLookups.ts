import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { JOIN_QUERY_KEYS } from '@modules/join/constants'
import { getJoinService } from '@modules/join/services/join.service'
import type { JoinLookupOption } from '@modules/join/types'

/**
 * Marketplace lookups (store types + cities) used by the merchant form.
 * Fetched lazily — only when the merchant form is visible.
 */
export function useJoinLookups(enabled: MaybeRefOrGetter<boolean> = true) {
  const isEnabled = computed(() => import.meta.client && toValue(enabled))

  const storeCategoriesQuery = useQuery({
    queryKey: JOIN_QUERY_KEYS.storeCategories(),
    queryFn: () => getJoinService().listStoreCategories(),
    enabled: isEnabled,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  })

  const citiesQuery = useQuery({
    queryKey: JOIN_QUERY_KEYS.cities(),
    queryFn: () => getJoinService().listCities(),
    enabled: isEnabled,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  })

  return {
    storeTypes: computed<JoinLookupOption[]>(() => storeCategoriesQuery.data.value ?? []),
    cities: computed<JoinLookupOption[]>(() => citiesQuery.data.value ?? []),
    isStoreTypesLoading: computed(() => isEnabled.value && storeCategoriesQuery.isPending.value),
    isCitiesLoading: computed(() => isEnabled.value && citiesQuery.isPending.value),
  }
}
