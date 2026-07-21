export type * from './api.types'

export type { JoinService, JoinProviderType } from '@modules/join/constants'

/** Internal (camelCase) form models — mapped to API DTOs by `JoinService`. */

export type JoinMerchantInput = {
  ownerName: string
  phone: string
  countryCode: string
  nationalId: string
  storeTypeId: string
  storeNameAr: string
  storeNameEn: string
  cityId: string
  address: string
}

export type JoinDriverInput = {
  fullName: string
  phone: string
  countryCode: string
  nationalId: string
  termsAccepted: boolean
}

export type JoinCompanyInput = {
  companyName: string
  companyAddress: string
  ownerName: string
  phone: string
  countryCode: string
  nationalId: string
  termsAccepted: boolean
}

export type JoinDoctorInput = {
  fullName: string
  email: string
  phone: string
  countryCode: string
  otherPhone: string
  nationalId: string
  termsAccepted: boolean
}

export type JoinClinicInput = {
  clinicName: string
  ownerName: string
  email: string
  phone: string
  countryCode: string
  otherPhone: string
  nationalId: string
  termsAccepted: boolean
}

export type JoinLookupOption = {
  value: string
  label: string
}
