<script setup lang="ts">
import { otpSchema } from '@shared/schemas/auth.schema'
import { ROUTES } from '@shared/constants/routes'
import { useAuth } from '@modules/auth/composables/useAuth'
import { isAuthError } from '@modules/auth/utils/errors'
import {
  clearPendingRegistration,
  maskPhone,
  readPendingRegistration,
  savePendingRegistration,
  type PendingRegistration,
} from '@modules/auth/utils/pending-registration'
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from '@shared/constants/country-codes'

const OTP_LENGTH = 6
const RESEND_SECONDS = 60

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { register, isLoading } = useAuth()

const pending = ref<PendingRegistration | null>(null)
const digits = ref<string[]>(Array.from({ length: OTP_LENGTH }, () => ''))
const inputRefs = ref<HTMLInputElement[]>([])
const formError = ref('')
const resendSeconds = ref(RESEND_SECONDS)
const isResending = ref(false)

let resendTimer: ReturnType<typeof setInterval> | null = null

const otpValue = computed(() => digits.value.join(''))
const canResend = computed(() => resendSeconds.value <= 0 && !isResending.value && !isLoading.value)

const dialCode = computed(() => {
  const code = pending.value?.countryCode
  const country = COUNTRY_CODES.find((item) => item.apiCode === code) ?? DEFAULT_COUNTRY_CODE
  return `${country.flag} ${country.dialCode}`
})

const maskedPhone = computed(() => {
  if (!pending.value?.phone) return ''
  return `${dialCode.value} ${maskPhone(pending.value.phone)}`
})

onMounted(() => {
  pending.value = readPendingRegistration()
  if (!pending.value) {
    toast.error(t('auth.otp.sessionExpired'))
    void navigateTo(localePath(ROUTES.AUTH.REGISTER))
    return
  }

  startResendTimer()
  nextTick(() => inputRefs.value[0]?.focus())
})

onBeforeUnmount(() => {
  stopResendTimer()
})

function setInputRef(el: Element | null, index: number) {
  if (el) inputRefs.value[index] = el as HTMLInputElement
}

function startResendTimer() {
  stopResendTimer()
  resendSeconds.value = RESEND_SECONDS
  resendTimer = setInterval(() => {
    if (resendSeconds.value <= 1) {
      resendSeconds.value = 0
      stopResendTimer()
      return
    }
    resendSeconds.value -= 1
  }, 1000)
}

function stopResendTimer() {
  if (!resendTimer) return
  clearInterval(resendTimer)
  resendTimer = null
}

function updateDigit(index: number, raw: string) {
  const value = raw.replace(/\D/g, '').slice(-1)
  digits.value[index] = value
  formError.value = ''

  if (value && index < OTP_LENGTH - 1) {
    inputRefs.value[index + 1]?.focus()
  }

  if (digits.value.every((digit) => digit) && otpValue.value.length === OTP_LENGTH) {
    void handleSubmit()
  }
}

function onKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    digits.value[index - 1] = ''
    inputRefs.value[index - 1]?.focus()
  }

  if (event.key === 'ArrowLeft' && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }

  if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
    inputRefs.value[index + 1]?.focus()
  }
}

function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  const pasted = event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, OTP_LENGTH) ?? ''
  if (!pasted) return

  digits.value = Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] ?? '')
  formError.value = ''

  const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
  inputRefs.value[focusIndex]?.focus()

  if (pasted.length === OTP_LENGTH) {
    void handleSubmit()
  }
}

async function handleSubmit() {
  formError.value = ''

  const validation = otpSchema.safeParse({ otp: otpValue.value })
  if (!validation.success) {
    formError.value = t(validation.error.issues[0]?.message ?? 'auth.validation.otpInvalid')
    return
  }

  if (!pending.value) {
    toast.error(t('auth.otp.sessionExpired'))
    await navigateTo(localePath(ROUTES.AUTH.REGISTER))
    return
  }

  try {
    await register({
      ...pending.value,
      otp: otpValue.value,
      otpCreatedAt: pending.value.createdAt,
    })

    clearPendingRegistration()
    toast.success(t('auth.otp.success'))
    await navigateTo(localePath(ROUTES.AUTH.LOGIN))
  } catch (error) {
    if (isAuthError(error)) {
      // Account already fully created from the previous step — treat as success.
      if (error.statusCode === 422 && !error.fieldErrors?.otp) {
        clearPendingRegistration()
        toast.success(t('auth.otp.success'))
        await navigateTo(localePath(ROUTES.AUTH.LOGIN))
        return
      }

      formError.value = error.fieldErrors?.otp?.[0] ?? error.message
      digits.value = Array.from({ length: OTP_LENGTH }, () => '')
      nextTick(() => inputRefs.value[0]?.focus())
      return
    }

    formError.value = t('errors.generic')
  }
}

async function handleResend() {
  if (!canResend.value || !pending.value) return

  isResending.value = true
  formError.value = ''

  try {
    const credentials = {
      name: pending.value.name,
      phone: pending.value.phone,
      countryCode: pending.value.countryCode,
      password: pending.value.password,
      confirmPassword: pending.value.confirmPassword,
      email: pending.value.email,
      nationalId: pending.value.nationalId,
    }
    await register(credentials)
    savePendingRegistration(credentials)
    pending.value = readPendingRegistration()
    digits.value = Array.from({ length: OTP_LENGTH }, () => '')
    toast.success(t('auth.otp.resent'))
    startResendTimer()
    nextTick(() => inputRefs.value[0]?.focus())
  } catch (error) {
    if (isAuthError(error) && error.statusCode === 401) {
      toast.success(t('auth.otp.resent'))
      startResendTimer()
      return
    }

    formError.value = isAuthError(error) ? error.message : t('errors.generic')
  } finally {
    isResending.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg overflow-hidden rounded-2xl border border-border/70 bg-white shadow-[0_24px_60px_-28px_rgba(45,83,61,0.4)]">
    <div class="border-b border-border/50 px-6 py-6 sm:px-8">
      <div class="mb-4 flex items-center gap-2">
        <span class="inline-flex h-7 items-center rounded-full bg-ibbil-green/10 px-2.5 text-xs font-semibold text-ibbil-green">
          {{ t('auth.steps.step', { current: 2, total: 2 }) }}
        </span>
        <span class="text-xs text-foreground-muted">{{ t('auth.steps.verifyPhone') }}</span>
      </div>

      <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-ibbil-green/10 text-ibbil-green">
        <Icon name="lucide:smartphone" class="h-6 w-6" />
      </div>

      <h2 class="text-xl font-bold text-ibbil-green">{{ t('auth.otp.title') }}</h2>
      <p class="mt-1 text-sm text-foreground-muted">{{ t('auth.otp.subtitle') }}</p>
      <p v-if="maskedPhone" class="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#f3f5f3] px-3 py-1.5 text-sm font-semibold text-ibbil-green">
        <Icon name="lucide:phone" class="h-3.5 w-3.5" />
        {{ maskedPhone }}
      </p>
    </div>

    <form class="space-y-6 px-6 py-6 sm:px-8 sm:py-7" novalidate @submit.prevent="handleSubmit">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div
          v-if="formError"
          class="rounded-xl border border-danger/25 bg-danger/5 px-3.5 py-2.5 text-sm text-danger"
          role="alert"
        >
          {{ formError }}
        </div>
      </Transition>

      <div class="space-y-3">
        <label class="block text-center text-sm font-semibold text-ibbil-green">
          {{ t('auth.otp.codeLabel') }}
        </label>

        <div
          class="flex justify-center gap-2 sm:gap-3"
          dir="ltr"
          role="group"
          :aria-label="t('auth.otp.codeLabel')"
          @paste="onPaste"
        >
          <input
            v-for="(_, index) in digits"
            :key="index"
            :ref="(el) => setInputRef(el as Element | null, index)"
            :value="digits[index]"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="1"
            class="h-12 w-10 rounded-xl border bg-[#fafbfa] text-center text-lg font-bold text-ibbil-green outline-none transition-all focus:border-ibbil-green focus:bg-white focus:ring-2 focus:ring-ibbil-green/15 sm:h-14 sm:w-12"
            :class="formError ? 'border-danger' : 'border-border'"
            :aria-label="t('auth.otp.digitLabel', { digit: index + 1 })"
            :disabled="isLoading"
            @input="updateDigit(index, ($event.target as HTMLInputElement).value)"
            @keydown="onKeydown(index, $event)"
          >
        </div>
      </div>

      <button
        type="submit"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-ibbil-green px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-ibbil-green/20 transition-all hover:bg-ibbil-green-dark hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isLoading || otpValue.length !== OTP_LENGTH"
      >
        <span v-if="isLoading" class="inline-flex items-center gap-2">
          <Icon name="lucide:loader-2" class="h-4 w-4 animate-spin" />
          {{ t('common.loading') }}
        </span>
        <span v-else>{{ t('auth.otp.verify') }}</span>
      </button>

      <div class="space-y-3 text-center text-sm">
        <p class="text-foreground-muted">
          <template v-if="canResend">
            {{ t('auth.otp.didNotReceive') }}
            <button
              type="button"
              class="font-semibold text-ibbil-green underline-offset-4 hover:underline disabled:opacity-60"
              :disabled="isResending"
              @click="handleResend"
            >
              <span v-if="isResending" class="inline-flex items-center gap-1">
                <Icon name="lucide:loader-2" class="h-3.5 w-3.5 animate-spin" />
                {{ t('common.loading') }}
              </span>
              <span v-else>{{ t('auth.otp.resend') }}</span>
            </button>
          </template>
          <template v-else>
            {{ t('auth.otp.resendIn', { seconds: resendSeconds }) }}
          </template>
        </p>

        <NuxtLinkLocale
          :to="ROUTES.AUTH.REGISTER"
          class="inline-flex items-center gap-1.5 font-semibold text-ibbil-gold transition-colors hover:text-ibbil-gold-hover"
        >
          <DirectionalArrow direction="back" size="xs" />
          {{ t('auth.otp.changeDetails') }}
        </NuxtLinkLocale>
      </div>
    </form>
  </div>
</template>
