<script setup lang="ts">
import { phoneRegisterSchema } from '@shared/schemas/auth.schema'
import { ROUTES } from '@shared/constants/routes'
import { useAuth } from '@modules/auth/composables/useAuth'
import { isAuthError } from '@modules/auth/utils/errors'
import { DEFAULT_COUNTRY_CODE, findCountryByApiCode } from '@shared/constants/country-codes'
import { savePendingRegistration } from '@modules/auth/utils/pending-registration'

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { register, isLoading } = useAuth()

const form = reactive({
  nationalId: '',
  phone: '',
  countryCode: DEFAULT_COUNTRY_CODE.apiCode,
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const touched = reactive<Record<string, boolean>>({})
const fieldErrors = reactive<Record<string, string>>({})
const formError = ref('')

const selectedCountry = computed(() => findCountryByApiCode(form.countryCode))

const passwordChecks = computed(() => {
  const value = form.password
  return [
    { key: 'length', ok: value.length >= 6, label: t('auth.passwordHints.minLength') },
    { key: 'letter', ok: /[A-Za-z\u0600-\u06FF]/.test(value), label: t('auth.passwordHints.letter') },
    { key: 'number', ok: /\d/.test(value), label: t('auth.passwordHints.number') },
  ]
})

const passwordStrength = computed(() => {
  const score = passwordChecks.value.filter((check) => check.ok).length
  if (!form.password) return { score: 0, label: '', tone: '' }
  if (score <= 1) return { score: 1, label: t('auth.passwordHints.weak'), tone: 'bg-danger' }
  if (score === 2) return { score: 2, label: t('auth.passwordHints.medium'), tone: 'bg-ibbil-gold' }
  return { score: 3, label: t('auth.passwordHints.strong'), tone: 'bg-ibbil-green' }
})

const passwordsMatch = computed(() => {
  if (!form.confirmPassword) return null
  return form.password === form.confirmPassword
})

const confirmWrapperClass = computed(() => {
  if (fieldErrors.confirmPassword || passwordsMatch.value === false) return 'border-danger'
  if (passwordsMatch.value) return 'border-ibbil-green/50'
  return undefined
})

watch(
  () => form.password,
  () => {
    if (touched.confirmPassword) validateField('confirmPassword')
  },
)

function clearErrors() {
  formError.value = ''
  for (const key of Object.keys(fieldErrors)) {
    fieldErrors[key] = ''
  }
}

function applyValidationErrors(issues: { path: PropertyKey[]; message: string }[]) {
  issues.forEach((issue) => {
    const field = String(issue.path[0] ?? '')
    if (field) fieldErrors[field] = t(issue.message)
  })
}

function validateField(field: keyof typeof form) {
  touched[field] = true
  const validation = phoneRegisterSchema.safeParse(form)

  fieldErrors[field] = ''

  if (!validation.success) {
    const issue = validation.error.issues.find((item) => String(item.path[0]) === field)
    if (issue) fieldErrors[field] = t(issue.message)
  }
}

function setDigitsOnly(field: 'nationalId', value: string | number, maxLength: number) {
  const cleaned = String(value).replace(/\D/g, '').slice(0, maxLength)
  form[field] = cleaned
  if (touched[field]) validateField(field)
}

function mapApiFieldErrors(apiFieldErrors: Record<string, string[]>) {
  const fieldMap: Record<string, string> = {
    name: 'name',
    email: 'email',
    national_id: 'nationalId',
    phone: 'phone',
    country_code: 'countryCode',
    password: 'password',
    confirm_password: 'confirmPassword',
  }

  Object.entries(apiFieldErrors).forEach(([field, messages]) => {
    const mapped = fieldMap[field] ?? field
    fieldErrors[mapped] = messages[0] ?? ''
  })
}

function scrollToFirstError() {
  const firstErrorField = Object.keys(fieldErrors).find((key) => fieldErrors[key])
  if (!firstErrorField) return
  const el = document.getElementById(
    `register-${firstErrorField === 'confirmPassword' ? 'confirm' : firstErrorField === 'nationalId' ? 'national-id' : firstErrorField}`,
  )
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el?.focus()
}

async function goToOtp() {
  toast.success(t('auth.registerOtpSent'))
  await navigateTo(localePath(ROUTES.AUTH.OTP))
}

async function handleSubmit() {
  clearErrors()
  Object.keys(form).forEach((key) => {
    touched[key] = true
  })

  const validation = phoneRegisterSchema.safeParse(form)
  if (!validation.success) {
    applyValidationErrors(validation.error.issues)
    await nextTick()
    scrollToFirstError()
    return
  }

  const credentials = {
    name: form.name.trim(),
    nationalId: form.nationalId,
    email: form.email.trim(),
    phone: form.phone,
    countryCode: form.countryCode,
    password: form.password,
    confirmPassword: form.confirmPassword,
  }

  savePendingRegistration(credentials)

  try {
    await register(credentials)
    await goToOtp()
  } catch (error) {
    if (isAuthError(error)) {
      // Inactive existing account — continue OTP verification.
      if (error.statusCode === 401) {
        await goToOtp()
        return
      }

      formError.value = error.message
      if (error.fieldErrors) {
        mapApiFieldErrors(error.fieldErrors)
        await nextTick()
        scrollToFirstError()
      }
      return
    }

    formError.value = t('errors.generic')
  }
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-[0_24px_60px_-28px_rgba(45,83,61,0.4)]">
    <div class="border-b border-border/50 px-6 py-6 sm:px-8">
      <div class="mb-4 flex items-center gap-2">
        <span class="inline-flex h-7 items-center rounded-full bg-ibbil-green/10 px-2.5 text-xs font-semibold text-ibbil-green">
          {{ t('auth.steps.step', { current: 1, total: 2 }) }}
        </span>
        <span class="text-xs text-foreground-muted">{{ t('auth.steps.accountDetails') }}</span>
      </div>
      <h2 class="text-xl font-bold text-ibbil-green">{{ t('auth.createAccount') }}</h2>
      <p class="mt-1 text-sm text-foreground-muted">{{ t('auth.registerSubtitle') }}</p>
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

      <section class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="flex h-6 w-6 items-center justify-center rounded-md bg-ibbil-green/10 text-ibbil-green">
            <Icon name="lucide:user-round" class="h-3.5 w-3.5" />
          </span>
          <h3 class="text-sm font-bold text-ibbil-green">{{ t('auth.sections.identity') }}</h3>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BaseInput
            id="register-national-id"
            :model-value="form.nationalId"
            :label="t('auth.nationalId')"
            :hint="t('auth.hints.nationalId')"
            :error="fieldErrors.nationalId"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            maxlength="14"
            required
            @update:model-value="setDigitsOnly('nationalId', $event, 14)"
            @blur="validateField('nationalId')"
          />

          <BasePhoneInput
            id="register-phone"
            v-model:phone="form.phone"
            v-model:country-code="form.countryCode"
            :label="t('auth.mobile')"
            :placeholder="selectedCountry.example"
            :hint="t('auth.hints.phone')"
            :error="fieldErrors.phone"
            :country-error="fieldErrors.countryCode"
            :country-aria-label="t('auth.countryCode')"
            required
            @blur="validateField('phone')"
            @country-change="touched.countryCode && validateField('countryCode')"
          />

          <BaseInput
            id="register-name"
            v-model="form.name"
            :label="t('auth.username')"
            :error="fieldErrors.name"
            type="text"
            autocomplete="username"
            maxlength="50"
            required
            @blur="validateField('name')"
          />

          <BaseInput
            id="register-email"
            v-model="form.email"
            :label="t('auth.email')"
            :error="fieldErrors.email"
            type="email"
            autocomplete="email"
            inputmode="email"
            required
            @blur="validateField('email')"
          />
        </div>
      </section>

      <section class="space-y-4 border-t border-border/60 pt-5">
        <div class="flex items-center gap-2">
          <span class="flex h-6 w-6 items-center justify-center rounded-md bg-ibbil-gold/15 text-ibbil-gold">
            <Icon name="lucide:lock-keyhole" class="h-3.5 w-3.5" />
          </span>
          <h3 class="text-sm font-bold text-ibbil-green">{{ t('auth.sections.security') }}</h3>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BaseInput
            id="register-password"
            v-model="form.password"
            :label="t('auth.secretPassword')"
            :error="fieldErrors.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            maxlength="64"
            required
            @blur="validateField('password')"
          >
            <template #suffix>
              <button
                type="button"
                class="rounded-md p-1 text-foreground-muted transition-colors hover:bg-surface-muted hover:text-ibbil-green"
                :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
                @click="showPassword = !showPassword"
              >
                <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-4 w-4" />
              </button>
            </template>

            <template v-if="!fieldErrors.password && form.password" #hint>
              <div class="space-y-2 pt-1">
                <div class="flex items-center gap-2">
                  <div class="flex h-1.5 flex-1 gap-1 overflow-hidden rounded-full">
                    <span
                      v-for="index in 3"
                      :key="index"
                      class="h-full flex-1 rounded-full transition-colors"
                      :class="passwordStrength.score >= index ? passwordStrength.tone : 'bg-border'"
                    />
                  </div>
                  <span class="text-[11px] font-medium text-foreground-muted">{{ passwordStrength.label }}</span>
                </div>
                <ul class="space-y-1">
                  <li
                    v-for="check in passwordChecks"
                    :key="check.key"
                    class="flex items-center gap-1.5 text-[11px]"
                    :class="check.ok ? 'text-ibbil-green' : 'text-foreground-muted'"
                  >
                    <Icon :name="check.ok ? 'lucide:check' : 'lucide:circle'" class="h-3 w-3" />
                    {{ check.label }}
                  </li>
                </ul>
              </div>
            </template>
          </BaseInput>

          <BaseInput
            id="register-confirm"
            v-model="form.confirmPassword"
            :label="t('auth.confirmPassword')"
            :error="fieldErrors.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            :wrapper-class="confirmWrapperClass"
            autocomplete="new-password"
            maxlength="64"
            required
            @blur="validateField('confirmPassword')"
          >
            <template #suffix>
              <button
                type="button"
                class="rounded-md p-1 text-foreground-muted transition-colors hover:bg-surface-muted hover:text-ibbil-green"
                :aria-label="showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <Icon :name="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-4 w-4" />
              </button>
            </template>

            <template v-if="!fieldErrors.confirmPassword" #hint>
              <p v-if="passwordsMatch === true" class="flex items-center gap-1 text-xs text-ibbil-green">
                <Icon name="lucide:check" class="h-3 w-3" />
                {{ t('auth.passwordHints.match') }}
              </p>
              <p v-else-if="passwordsMatch === false" class="text-xs text-danger">
                {{ t('auth.validation.passwordMismatch') }}
              </p>
            </template>
          </BaseInput>
        </div>
      </section>

      <BaseButton type="submit" variant="brand" block :loading="isLoading">
        <template v-if="!isLoading">
          {{ t('auth.continueToOtp') }}
          <DirectionalArrow direction="forward" size="xs" />
        </template>
        <template v-else>
          {{ t('common.loading') }}
        </template>
      </BaseButton>

      <p class="text-center text-sm text-foreground-muted">
        {{ t('auth.hasAccount') }}
        <NuxtLinkLocale
          :to="ROUTES.AUTH.LOGIN"
          class="font-semibold text-ibbil-green underline-offset-4 hover:underline"
        >
          {{ t('auth.login') }}
        </NuxtLinkLocale>
      </p>
    </form>
  </div>
</template>
