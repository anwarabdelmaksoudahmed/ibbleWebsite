export const PAYMENT_ENDPOINTS = {
  INITIATE: '/v1/payment/initiate',
  verify: (transactionId: string) =>
    `/v1/payment/verify/${encodeURIComponent(transactionId)}`,
  status: (transactionId: string) =>
    `/v1/payment/status/${encodeURIComponent(transactionId)}`,
  cancel: (transactionId: string) =>
    `/v1/payment/cancel/${encodeURIComponent(transactionId)}`,
} as const
