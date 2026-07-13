import { OrdersApi } from '@modules/checkout/api/orders.api'
import { CHECKOUT_PAYMENT_METHOD_IDS } from '@modules/checkout/constants/payment-methods'
import type { CreateOrderInput } from '@modules/checkout/types'
import type { CreateOrderApiResponse } from '@modules/checkout/types/api.types'
import type { InitiatePaymentApiRequest } from '@shared/payment/types/api.types'

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
    const response = await this.api.create({
      address_id: input.addressId,
      store_id: input.storeId,
      payment_method_id: CHECKOUT_PAYMENT_METHOD_IDS[input.paymentMethodId],
      PIN_code: input.pinCode ?? '',
      coupon_code: input.couponCode ?? '',
    })

    return unwrapOrderResponse(response)
  }
}

export function toInitiatePayload(order: CreateOrderApiResponse): InitiatePaymentApiRequest {
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
