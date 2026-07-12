import { ENDPOINTS } from '@shared/constants/endpoints'
import { CrudApiService } from '@core/api/crud-service'

export type Product = {
  id: string
  name: string
  sku: string
  price: number
  status: string
}

export type ProductForm = {
  name: string
  sku: string
  price: number
  status: string
}

export class ProductsService extends CrudApiService<Product, Product, ProductForm, ProductForm> {
  protected readonly endpoints = {
    list: ENDPOINTS.PRODUCTS.BASE,
    detail: (id: string | number) => ENDPOINTS.PRODUCTS.BY_ID(String(id)),
  }
}

export const productsService = new ProductsService()
