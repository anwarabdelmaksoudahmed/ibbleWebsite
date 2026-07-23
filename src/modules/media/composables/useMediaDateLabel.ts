import { dayjs } from '@shared/utils/formatters'

export function useMediaDateLabel(raw: MaybeRefOrGetter<string | undefined | null>) {
  const { locale } = useI18n()

  return computed(() => {
    const value = toValue(raw)?.trim()
    if (!value) return ''

    const parsed = dayjs(value)
    if (!parsed.isValid()) return value

    return parsed.locale(locale.value).format('D MMM YYYY')
  })
}
