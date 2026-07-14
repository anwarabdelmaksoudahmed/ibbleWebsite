export type StoreCategory = {
  id: string
  name: string
  content: string
  description: string
  slug: string
  logo: string
  cover: string
  commissionPercentage: number
}

export type Store = {
  id: string
  name: string
  description: string
  slug: string
  logo: string
  cover: string
  productsCount: number
  cityName: string
  address: string
}

export type StoreSocialLink = {
  platform: string
  url: string
}

/** Full store profile used on the public store page */
export type StoreProfile = {
  id: string
  name: string
  description: string
  about: string
  policies: string
  address: string
  slug: string
  logo: string
  cover: string
  productsCount: number
  viewsCount: number
  reviewsCount: number
  favoritesCount: number
  cityName: string
  countryName: string
  categoryName: string
  categorySlug: string
  socialLinks: StoreSocialLink[]
}

export type CategoryStoresMeta = {
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}

export type CategoryStoresResult = {
  stores: Store[]
  meta: CategoryStoresMeta
  categoryName: string
}

export type StoreProductCategory = {
  id: string
  name: string
  description: string
  image: string
  productsCount: number
}

export type StoreProduct = {
  id: string
  storeId: string
  name: string
  description: string
  image: string
  price: number
  finalPrice: number
  discount: number
  rating: number | null
  categoryId: string
  categoryName: string
}

/** Full product detail for the public product page */
export type StoreProductDetail = StoreProduct & {
  content: string
  images: string[]
  quantity: number
  sku: string
  relatedProducts: StoreProduct[]
}

export type StoreProductsResult = {
  products: StoreProduct[]
  meta: CategoryStoresMeta
}
