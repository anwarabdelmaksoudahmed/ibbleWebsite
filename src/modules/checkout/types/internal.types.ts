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
