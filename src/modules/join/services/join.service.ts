import { JoinApi } from '@modules/join/api/join.api'
import type {
  JoinApiResponse,
  JoinCitiesApiResponse,
  JoinClinicInput,
  JoinCompanyInput,
  JoinDoctorInput,
  JoinDriverInput,
  JoinLookupOption,
  JoinMerchantInput,
  JoinStoreCategoriesApiResponse,
} from '@modules/join/types'

function mapLookupOptions(
  payload: JoinCitiesApiResponse | JoinStoreCategoriesApiResponse | null | undefined,
): JoinLookupOption[] {
  if (!payload) return []
  const list = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : []
  return list
    .map((dto) => ({ value: String(dto.id ?? ''), label: (dto.name ?? '').trim() }))
    .filter((option) => option.value && option.label)
}

export class JoinService {
  private readonly api: JoinApi

  constructor(api?: JoinApi) {
    if (api) {
      this.api = api
      return
    }

    const config = useRuntimeConfig()
    this.api = new JoinApi({
      marketplace: config.public.apiBaseUrl as string,
      transportation: config.public.transportationApiBaseUrl as string,
      veterinary: config.public.veterinaryApiBaseUrl as string,
    })
  }

  join(input: JoinMerchantInput): Promise<JoinApiResponse> {
    return this.api.join({
      name: input.ownerName.trim(),
      phone: input.phone.trim(),
      country_code: input.countryCode,
      national_id: input.nationalId.trim(),
      store_type_id: input.storeTypeId,
      store_name_ar: input.storeNameAr.trim(),
      store_name_en: input.storeNameEn.trim(),
      city_id: input.cityId,
      address: input.address.trim(),
    })
  }

  joinDriver(input: JoinDriverInput): Promise<JoinApiResponse> {
    return this.api.joinDriver({
      name: input.fullName.trim(),
      phone: input.phone.trim(),
      country_code: input.countryCode,
      national_id: input.nationalId.trim(),
      commission_approved: input.termsAccepted,
    })
  }

  joinCompany(input: JoinCompanyInput): Promise<JoinApiResponse> {
    return this.api.joinCompany({
      name: input.companyName.trim(),
      address: input.companyAddress.trim(),
      owner_name: input.ownerName.trim(),
      phone: input.phone.trim(),
      country_code: input.countryCode,
      national_id: input.nationalId.trim(),
      commission_approved: input.termsAccepted,
    })
  }

  joinDoctor(input: JoinDoctorInput): Promise<JoinApiResponse> {
    return this.api.joinDoctor({
      name: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      country_code: input.countryCode,
      ...(input.otherPhone.trim() ? { other_phone: input.otherPhone.trim() } : {}),
      national_id: input.nationalId.trim(),
      commission_approved: input.termsAccepted,
    })
  }

  joinClinic(input: JoinClinicInput): Promise<JoinApiResponse> {
    return this.api.joinClinic({
      name: input.clinicName.trim(),
      owner_name: input.ownerName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      country_code: input.countryCode,
      ...(input.otherPhone.trim() ? { other_phone: input.otherPhone.trim() } : {}),
      national_id: input.nationalId.trim(),
      commission_approved: input.termsAccepted,
    })
  }

  async listCities(): Promise<JoinLookupOption[]> {
    const response = await this.api.listCities()
    return mapLookupOptions(response)
  }

  async listStoreCategories(): Promise<JoinLookupOption[]> {
    const response = await this.api.listStoreCategories()
    return mapLookupOptions(response)
  }
}

let joinService: JoinService | null = null

export function getJoinService(): JoinService {
  if (!joinService) {
    joinService = new JoinService()
  }
  return joinService
}
