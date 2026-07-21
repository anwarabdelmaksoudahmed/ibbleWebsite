import { OrdersApi } from '@modules/checkout/api/orders.api'
import { CHECKOUT_PAYMENT_METHOD_IDS } from '@modules/checkout/constants/payment-methods'
import type { CreateOrderInput, CustomerOrdersPage } from '@modules/checkout/types'
import type {
  CardOrderApiResponse,
  CreateOrderApiRequest,
  CreateOrderApiResponse,
  CustomerOrdersQueryParams,
  WalletOrderApiResponse,
} from '@modules/checkout/types/api.types'
import type { InitiatePaymentApiRequest } from '@shared/payment/types/api.types'
import { mapCustomerOrdersPage } from '@modules/checkout/utils/mappers'

export function isCardOrderResponse(
  order: CreateOrderApiResponse,
): order is CardOrderApiResponse {
  return 'merchant_transaction_id' in order && order.merchant_transaction_id != null
}

export function isWalletOrderResponse(
  order: CreateOrderApiResponse,
): order is WalletOrderApiResponse {
  return !isCardOrderResponse(order)
}

function unwrapOrderResponse(payload: unknown): CreateOrderApiResponse {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid order response')
  }

  const record = payload as Record<string, unknown>
  if (record.data && typeof record.data === 'object') {
    return record.data as CreateOrderApiResponse
  }

  return payload as CreateOrderApiResponse
}

export class OrdersService {
  private readonly api: OrdersApi

  constructor(api?: OrdersApi) {
    this.api = api ?? new OrdersApi()
  }

  async create(input: CreateOrderInput): Promise<CreateOrderApiResponse> {
    const payload: CreateOrderApiRequest = {
      address_id: input.addressId,
      store_id: input.storeId,
      payment_method_id: CHECKOUT_PAYMENT_METHOD_IDS[input.paymentMethodId],
    }

    const pinCode = input.pinCode?.trim()
    if (pinCode) {
      payload.PIN_code = pinCode
    }

    const couponCode = input.couponCode?.trim()
    if (couponCode) {
      payload.coupon_code = couponCode
    }

    const response = await this.api.create(payload)
    return unwrapOrderResponse(response)
  }

  async listCustomerOrders(
    params: CustomerOrdersQueryParams = {},
    options?: { signal?: AbortSignal },
  ): Promise<CustomerOrdersPage> {
    const response = await this.api.listCustomerOrders(params, options)
    return mapCustomerOrdersPage(response)
  }
}

export function toInitiatePayload(order: CardOrderApiResponse): InitiatePaymentApiRequest {
  return {
    message: order.message,
    amount: order.amount,
    currency: order.currency,
    payment_type: order.payment_type,
    merchant_transaction_id: order.merchant_transaction_id,
    description: order.description,
    module: order.module,
    payment_method_id: order.payment_method_id,
    address: order.address,
    invoice: order.invoice ?? null,
  }
}

let ordersService: OrdersService | null = null

export function getOrdersService(): OrdersService {
  if (!ordersService) {
    ordersService = new OrdersService()
  }
  return ordersService
}
