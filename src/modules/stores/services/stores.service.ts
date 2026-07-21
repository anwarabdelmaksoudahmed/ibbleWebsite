import { BaseApiService } from '@core/api/base-service'
import { isApiError, normalizeApiError } from '@core/api/http/errors'
import {
  CONTENT_FALLBACK_LOCALE,
  shouldRetryWithContentFallback,
} from '@core/api/http/content-locale'
import { STORES_ENDPOINTS } from '@modules/stores/constants/endpoints'
import type {
  CategoryStoresApiResponse,
  CategoryStoresQueryParams,
  StoreCategoryApiDto,
  StoreDetailApiDto,
  StoreProductApiDto,
  StoreProductCategoriesApiResponse,
  StoreProductsApiResponse,
  StoreProductsQueryParams,
} from '@modules/stores/types/api.types'
import type {
  CategoryStoresResult,
  StoreProductCategory,
  StoreProductDetail,
  StoreProductsResult,
  StoreProfile,
  StoreCategory,
} from '@modules/stores/types/internal.types'
import {
  mapCategoryStoresResponse,
  mapStoreCategories,
  mapStoreProductCategoriesResponse,
  mapStoreProductDetail,
  mapStoreProductsResponse,
  mapStoreProfile,
} from '@modules/stores/utils/mappers'

function storeProductsQuery(params: StoreProductsQueryParams = {}) {
  return {
    ...(params.category ? { category: params.category } : {}),
    page: params.page ?? 1,
    limit: params.limit ?? 12,
  }
}

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
    try {
      const { data } = await this.client.get<StoreProductCategoriesApiResponse>(
        STORES_ENDPOINTS.PRODUCT_CATEGORIES(slug),
      )
      return mapStoreProductCategoriesResponse(data)
    } catch (error) {
      const apiError = isApiError(error) ? error : normalizeApiError(error)
      if (apiError.statusCode !== 404 || !shouldRetryWithContentFallback()) {
        throw error
      }

      const { data } = await this.client.get<StoreProductCategoriesApiResponse>(
        STORES_ENDPOINTS.PRODUCT_CATEGORIES(slug),
        { apiLocale: CONTENT_FALLBACK_LOCALE },
      )
      return mapStoreProductCategoriesResponse(data)
    }
  }

  async listStoreProducts(
    slug: string,
    params: StoreProductsQueryParams = {},
  ): Promise<StoreProductsResult> {
    const query = storeProductsQuery(params)
    const { data } = await this.client.get<StoreProductsApiResponse>(
      STORES_ENDPOINTS.PRODUCTS(slug),
      { params: query },
    )

    const result = mapStoreProductsResponse(data)

    // EN returns `data: []` while meta still reports items (missing translations).
    if (
      result.products.length === 0 &&
      result.meta.totalItems > 0 &&
      shouldRetryWithContentFallback()
    ) {
      const { data: fallback } = await this.client.get<StoreProductsApiResponse>(
        STORES_ENDPOINTS.PRODUCTS(slug),
        { params: query, apiLocale: CONTENT_FALLBACK_LOCALE },
      )
      return mapStoreProductsResponse(fallback)
    }

    return result
  }

  /** Product detail body is unwrapped (not `{ data: ... }`). */
  async getProductById(id: string): Promise<StoreProductDetail> {
    try {
      const { data } = await this.client.get<StoreProductApiDto>(
        STORES_ENDPOINTS.PRODUCT_BY_ID(id),
      )
      return mapStoreProductDetail(data)
    } catch (error) {
      const apiError = isApiError(error) ? error : normalizeApiError(error)
      if (apiError.statusCode !== 404 || !shouldRetryWithContentFallback()) {
        throw error
      }

      const { data } = await this.client.get<StoreProductApiDto>(
        STORES_ENDPOINTS.PRODUCT_BY_ID(id),
        { apiLocale: CONTENT_FALLBACK_LOCALE },
      )
      return mapStoreProductDetail(data)
    }
  }
}

let storesService: StoresService | null = null

export function getStoresService(): StoresService {
  if (!storesService) {
    storesService = new StoresService()
  }
  return storesService
}
