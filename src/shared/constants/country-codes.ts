export type CountryCodeOption = {
  label: string
  dialCode: string
  apiCode: string
  flag: string
  /** National number example shown as input placeholder */
  example: string
}

export const DEFAULT_COUNTRY_CODE: CountryCodeOption = {
  label: 'Saudi Arabia',
  dialCode: '+966',
  apiCode: '002',
  flag: '🇸🇦',
  example: '5XXXXXXXX',
}

export const COUNTRY_CODES: CountryCodeOption[] = [
  DEFAULT_COUNTRY_CODE,
  { label: 'Egypt', dialCode: '+20', apiCode: '0020', flag: '🇪🇬', example: '10XXXXXXXX' },
  { label: 'UAE', dialCode: '+971', apiCode: '00971', flag: '🇦🇪', example: '5XXXXXXXX' },
  { label: 'Kuwait', dialCode: '+965', apiCode: '00965', flag: '🇰🇼', example: '9XXXXXXX' },
  { label: 'Bahrain', dialCode: '+973', apiCode: '00973', flag: '🇧🇭', example: '3XXXXXXX' },
  { label: 'Qatar', dialCode: '+974', apiCode: '00974', flag: '🇶🇦', example: '3XXXXXXX' },
  { label: 'Oman', dialCode: '+968', apiCode: '00968', flag: '🇴🇲', example: '9XXXXXXX' },
]


export function findCountryByApiCode(apiCode: string): CountryCodeOption {
  return COUNTRY_CODES.find((country) => country.apiCode === apiCode) ?? DEFAULT_COUNTRY_CODE
}
