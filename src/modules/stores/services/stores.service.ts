import { BaseApiService } from '@core/api/base-service'
import { STORES_ENDPOINTS } from '@modules/stores/constants/endpoints'
import type {
  CategoryStoresApiResponse,
  CategoryStoresQueryParams,
  StoreCategoryApiDto,
  StoreDetailApiDto,
  StoreProductCategoriesApiResponse,
  StoreProductsApiResponse,
  StoreProductsQueryParams,
} from '@modules/stores/types/api.types'
import type {
  CategoryStoresResult,
  StoreProductCategory,
  StoreProductsResult,
  StoreProfile,
  StoreCategory,
} from '@modules/stores/types/internal.types'
import {
  mapCategoryStoresResponse,
  mapStoreCategories,
  mapStoreProductCategoriesResponse,
  mapStoreProductsResponse,
  mapStoreProfile,
} from '@modules/stores/utils/mappers'

export class StoresService extends BaseApiService {
  async listCategories(): Promise<StoreCategory[]> {
    const data = await this.get<StoreCategoryApiDto[]>(STORES_ENDPOINTS.CATEGORIES)
    return mapStoreCategories(data)
  }

  async listCategoryStores(
    slug: string,
    params: CategoryStoresQueryParams = {},
  ): Promise<CategoryStoresResult> {
    const { data } = await this.client.get<CategoryStoresApiResponse>(
      STORES_ENDPOINTS.CATEGORY_STORES(slug),
      {
        params: {
          country: params.country ?? '',
          city: params.city ?? '',
          order: params.order ?? 'DESC',
          page: params.page ?? 1,
          limit: params.limit ?? 10,
        },
      },
    )

    return mapCategoryStoresResponse(data)
  }

  /** Store detail body is unwrapped (not `{ data: ... }`). */
  async getStoreBySlug(slug: string): Promise<StoreProfile> {
    const { data } = await this.client.get<StoreDetailApiDto>(STORES_ENDPOINTS.BY_SLUG(slug))
    return mapStoreProfile(data)
  }

  async listStoreProductCategories(slug: string): Promise<StoreProductCategory[]> {
    const { data } = await this.client.get<StoreProductCategoriesApiResponse>(
      STORES_ENDPOINTS.PRODUCT_CATEGORIES(slug),
    )
    return mapStoreProductCategoriesResponse(data)
  }

  async listStoreProducts(
    slug: string,
    params: StoreProductsQueryParams = {},
  ): Promise<StoreProductsResult> {
    const { data } = await this.client.get<StoreProductsApiResponse>(
      STORES_ENDPOINTS.PRODUCTS(slug),
      {
        params: {
          ...(params.category ? { category: params.category } : {}),
          page: params.page ?? 1,
          limit: params.limit ?? 12,
        },
      },
    )

    return mapStoreProductsResponse(data)
  }
}

let storesService: StoresService | null = null

export function getStoresService(): StoresService {
  if (!storesService) {
    storesService = new StoresService()
  }
  return storesService
}
