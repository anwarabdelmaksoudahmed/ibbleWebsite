export type CustomerAddress = {
  id: string
  name: string
  email: string
  phone: string
  countryCode: string
  address: string
  isDefault: boolean
  zipCode: string
  countryId: string
  countryFlag: string
  countryName: string
  cityId: string
  cityName: string
}

export type AddressFormInput = {
  name: string
  email: string
  phone: string
  countryCode: string
  address: string
  countryId: string
  cityId: string
  zipCode: string
  isDefault: boolean
}

export type CheckoutCity = {
  id: string
  name: string
  countryId: string
}

export type CheckoutCountry = {
  id: string
  name: string
  flag: string
  code: string
}

export type UserWallet = {
  id: string
  balance: number
  currency: string
  status: string
  name: string
}

export type WalletBankInfo = {
  accountName: string
  bankName: string
  iban: string
}

export type WalletDetails = {
  id: string
  userId: string
  balance: number
  currency: string
  totalWithdraw: number
  totalDeposit: number
  withdrawCount: number
  depositCount: number
  pendingAmount: number | null
  bankInfo: WalletBankInfo | null
  createdAt: string
}

export type WalletTransactionSource = 'wallet' | 'card'

export type WalletTransaction = {
  id: string
  amount: number
  title: string
  status: string
  type: string
  transactionId: string
  orderId: string
  module: string
  paymentMethod: string
  paymentSource: WalletTransactionSource
  createdAt: string
}

export type WalletTransactionsPage = {
  items: WalletTransaction[]
  count: number
  totalPages: number
  currentPage: number
  itemsPerPage: number
}

export type PaymentMethodId = 'wallet' | 'card'

export type DiscountDraft = {
  code: string
  applied: boolean
}

export type CreateOrderInput = {
  addressId: string
  storeId: string
  paymentMethodId: PaymentMethodId
  pinCode?: string
  couponCode?: string
}

export type CustomerOrderProduct = {
  id: string
  qty: number
  price: number
  name: string
  description: string
  image: string
  productId: string
}

export type CustomerOrderStore = {
  id: string
  name: string
  logo: string
  url: string
  cityName: string
  categoryName: string
  categorySlug: string
}

export type CustomerOrderAddress = {
  name: string
  phone: string
  countryCode: string
  email: string
  address: string
}

export type CustomerOrder = {
  id: string
  orderNum: string
  status: string
  totalAmount: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  subTotal: number
  couponCode: string
  invoiceUrl: string | null
  createdAt: string
  address: CustomerOrderAddress
  store: CustomerOrderStore
  products: CustomerOrderProduct[]
  productsCount: number
}

export type CustomerOrdersPage = {
  items: CustomerOrder[]
  count: number
  totalPages: number
  currentPage: number
  itemsPerPage: number
}
