import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { APP_CONFIG } from '@shared/constants/app-config'
import { formatMoneyAmount } from '@shared/utils/format-money'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

export function formatDate(
  date: string | Date | dayjs.Dayjs,
  format = APP_CONFIG.DATE_FORMAT,
): string {
  return dayjs(date).format(format)
}

export function formatDateTime(
  date: string | Date | dayjs.Dayjs,
  format = APP_CONFIG.DATETIME_FORMAT,
): string {
  return dayjs(date).format(format)
}

export function formatRelative(date: string | Date | dayjs.Dayjs): string {
  return dayjs(date).fromNow()
}

export function formatCurrency(
  amount: number,
  currency: string = APP_CONFIG.CURRENCY,
  locale: string = APP_CONFIG.LOCALE,
): string {
  if (currency === 'SAR') {
    return formatMoneyAmount(amount, locale.startsWith('ar') ? 'ar' : 'en')
  }
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
}

export function formatNumber(
  value: number,
  locale = APP_CONFIG.LOCALE,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value)
}

export { dayjs }
