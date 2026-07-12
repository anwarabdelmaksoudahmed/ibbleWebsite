export type CountryCodeOption = {
  label: string
  dialCode: string
  apiCode: string
  flag: string
}

export const DEFAULT_COUNTRY_CODE: CountryCodeOption = {
  label: 'Saudi Arabia',
  dialCode: '+966',
  apiCode: '002',
  flag: '🇸🇦',
}

export const COUNTRY_CODES: CountryCodeOption[] = [
  DEFAULT_COUNTRY_CODE,
  { label: 'UAE', dialCode: '+971', apiCode: '00971', flag: '🇦🇪' },
  { label: 'Kuwait', dialCode: '+965', apiCode: '00965', flag: '🇰🇼' },
  { label: 'Bahrain', dialCode: '+973', apiCode: '00973', flag: '🇧🇭' },
  { label: 'Qatar', dialCode: '+974', apiCode: '00974', flag: '🇶🇦' },
  { label: 'Oman', dialCode: '+968', apiCode: '00968', flag: '🇴🇲' },
]
