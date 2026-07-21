export function useProfileFavorites() {
  const { wishlist, isLoading, isFetching, isError, refetch } = useWishlist()

  const search = ref('')

  const items = computed(() => {
    const query = search.value.trim().toLowerCase()
    const list = wishlist.value.items.filter((item) => item.name.trim().length > 0)

    if (!query) return list

    return list.filter((item) => {
      const haystack = [item.name, item.storeName, item.product.categoryName]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  })

  const totalCount = computed(() => wishlist.value.productIds.size)

  const isEmpty = computed(
    () => !isLoading.value && !isError.value && items.value.length === 0,
  )

  const hasActiveSearch = computed(() => search.value.trim().length > 0)

  function resetFilters() {
    search.value = ''
  }

  return {
    search,
    items,
    totalCount,
    isLoading,
    isFetching,
    isError,
    isEmpty,
    hasActiveSearch,
    resetFilters,
    refetch,
  }
}
