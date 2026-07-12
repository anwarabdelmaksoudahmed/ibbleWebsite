/** Raw API shape — matches marketplace `/stores-categories` contract */
export type StoreCategoryApiDto = {
  id: string
  name: string
  content: string
  description: string
  slug: string
  logo: string
  cover: string
  commission_percentage: number
}

export type StoreCityApiDto = {
  id: string
  name: string
  country: string
}

export type StoreCountryApiDto = {
  id: string
  name: string
  flag: string
  code: string
}

/** Raw API shape — matches `/v1/category/:slug/stores` contract */
export type StoreApiDto = {
  id: string
  name: string
  description: string
  about: string
  policies: string
  address: string
  logo: string
  cover: string
  /** Store public slug used in URLs */
  url: string
  status: string
  created_at: string
  items_count: string | number
  total_views: string | number
  social_media_links: string
  city: StoreCityApiDto | null
  category: StoreCategoryApiDto
  total_reviews: number
  total_favourites: number
}

/** Raw API shape — matches `/v1/stores/:slug` (unwrapped body) */
export type StoreDetailApiDto = StoreApiDto & {
  translation_id?: string
  content?: string
  country: StoreCountryApiDto | null
}

/** Nest-style pagination meta from category stores endpoint */
export type CategoryStoresMetaApiDto = {
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}

export type CategoryStoresApiResponse = {
  data: StoreApiDto[]
  meta: CategoryStoresMetaApiDto
  category: string
}

export type CategoryStoresQueryParams = {
  country?: string
  city?: string
  order?: 'ASC' | 'DESC'
  page?: number
  limit?: number
}

export type StoreSocialLinkApiDto = {
  selectSocial: string
  link: string
}

/** Raw API shape — matches `/v1/:slug/product-categories` */
export type StoreProductCategoryApiDto = {
  id: string
  translation_id?: string
  name: string
  description: string
  parent_id: string | null
  image: string
  is_featured: number
  status: string
  order: number
  num_of_products: number
}

export type StoreProductCategoriesApiResponse = {
  data: StoreProductCategoryApiDto[]
  meta: CategoryStoresMetaApiDto
}

export type StoreProductPriceInfoApiDto = {
  final_price: number
  price_without_tax: number
  tax: number
  discount: number
}

/** Raw API shape — matches `/v1/:slug/products` */
export type StoreProductApiDto = {
  id: string
  name: string
  content: string
  description: string
  featured_image: string
  status: string
  store_id: string
  created_at: string
  quantity: number
  price: number
  sku: string
  product_images: string[]
  product_categories: StoreProductCategoryApiDto[]
  discounts: unknown[]
  price_info: StoreProductPriceInfoApiDto | null
  stars: number | null
}

export type StoreProductsApiResponse = {
  data: StoreProductApiDto[]
  meta: CategoryStoresMetaApiDto
}

export type StoreProductsQueryParams = {
  category?: string
  page?: number
  limit?: number
}
