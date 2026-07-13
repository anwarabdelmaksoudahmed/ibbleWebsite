export type PaymentOrderAddressDto = {
  customer_email: string
  country: string
  state: string
  street1: string
  postcode: string
  first_name: string
  last_name: string
}

/** Mirrors the marketplace order confirmation payload passed to `/v1/payment/initiate`. */
export type InitiatePaymentApiRequest = {
  message?: string
  amount: number
  currency: string
  payment_type: string
  merchant_transaction_id: number | string
  description: string
  module: string
  payment_method_id: number | string
  address: PaymentOrderAddressDto
  invoice?: unknown | null
}

export type InitiatePaymentApiResponse = {
  status: number
  message: string
  gateway: string
  checkout_id: string
  transaction_id: string
}

export type VerifyPaymentApiRequest = {
  resource_path?: string
  checkout_id?: string
}

export type VerifyPaymentApiResponse = {
  status: number
  message: string
  transaction_id: string
  payment_status?: string
}

export type PaymentStatusApiResponse = {
  status: number
  message: string
  transaction_id: string
  payment_status: string
}

export type CancelPaymentApiResponse = {
  status: number
  message: string
  transaction_id: string
}
