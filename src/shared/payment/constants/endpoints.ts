export const PAYMENT_ENDPOINTS = {
  INITIATE: '/v1/payment/initiate',
  CHECK_STATUS: '/v1/payment/check-status',
  status: (transactionId: string) =>
    `/v1/payment/status/${encodeURIComponent(transactionId)}`,
  cancel: (transactionId: string) =>
    `/v1/payment/cancel/${encodeURIComponent(transactionId)}`,
} as const
