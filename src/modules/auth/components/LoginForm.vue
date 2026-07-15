<script setup lang="ts">
import { phoneLoginSchema } from '@shared/schemas/auth.schema'
import { ROUTES } from '@shared/constants/routes'
import { useAuth } from '@modules/auth/composables/useAuth'
import { isAuthError } from '@modules/auth/utils/errors'
import { DEFAULT_COUNTRY_CODE } from '@shared/constants/country-codes'

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const toast = useToast()
const { login, isLoading } = useAuth()

const form = reactive({
  phone: '',
  countryCode: DEFAULT_COUNTRY_CODE.apiCode,
  password: '',
  remember: false,
})

const showPassword = ref(false)
const touched = reactive<Record<string, boolean>>({})
const fieldErrors = reactive<Record<string, string>>({})
const formError = ref('')

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

function validateField(field: 'phone' | 'password' | 'countryCode') {
  touched[field] = true
  fieldErrors[field] = ''

  const validation = phoneLoginSchema.safeParse(form)
  if (!validation.success) {
    const issue = validation.error.issues.find((item) => String(item.path[0]) === field)
    if (issue) fieldErrors[field] = t(issue.message)
  }
}

function mapApiFieldErrors(apiFieldErrors: Record<string, string[]>) {
  const fieldMap: Record<string, string> = {
    phone: 'phone',
    password: 'password',
    country_code: 'countryCode',
  }

  Object.entries(apiFieldErrors).forEach(([field, messages]) => {
    const mapped = fieldMap[field] ?? field
    fieldErrors[mapped] = messages[0] ?? ''
  })
}

function scrollToFirstError() {
  const firstErrorField = ['phone', 'password', 'countryCode'].find((key) => fieldErrors[key])
  if (!firstErrorField) return
  const el = document.getElementById(`login-${firstErrorField === 'countryCode' ? 'phone' : firstErrorField}`)
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el?.focus()
}

async function handleSubmit() {
  clearErrors()
  touched.phone = true
  touched.password = true
  touched.countryCode = true

  const validation = phoneLoginSchema.safeParse(form)
  if (!validation.success) {
    applyValidationErrors(validation.error.issues)
    await nextTick()
    scrollToFirstError()
    return
  }

  try {
    await login({
      phone: form.phone,
      password: form.password,
      countryCode: form.countryCode,
      remember: form.remember,
    })

    toast.success(t('auth.loginSuccess'))

    const redirect =
      typeof route.query.redirect === 'string' ? route.query.redirect : localePath(ROUTES.HOME)
    await navigateTo(redirect)
  } catch (error) {
    if (isAuthError(error)) {
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
      <h2 class="text-xl font-bold text-ibbil-green">{{ t('auth.welcomeBack') }}</h2>
      <p class="mt-1 text-sm text-foreground-muted">{{ t('auth.loginSubtitle') }}</p>
    </div>

    <form class="space-y-5 px-6 py-6 sm:px-8 sm:py-7" novalidate @submit.prevent="handleSubmit">
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

      <BasePhoneInput
        id="login-phone"
        v-model:phone="form.phone"
        v-model:country-code="form.countryCode"
        :label="t('auth.mobile')"
        :hint="t('auth.hints.phone')"
        :error="fieldErrors.phone"
        :country-error="fieldErrors.countryCode"
        :country-aria-label="t('auth.countryCode')"
        required
        @blur="validateField('phone')"
        @country-change="touched.countryCode && validateField('countryCode')"
      />

      <BaseInput
        id="login-password"
        v-model="form.password"
        :label="t('auth.secretPassword')"
        :placeholder="t('auth.passwordPlaceholder')"
        :error="fieldErrors.password"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="current-password"
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
      </BaseInput>

      <div class="flex items-center justify-between gap-3">
        <BaseCheckbox
          id="login-remember"
          v-model="form.remember"
          :label="t('auth.rememberMe')"
        />
        <NuxtLinkLocale
          :to="ROUTES.AUTH.FORGOT_PASSWORD"
          class="shrink-0 text-sm font-semibold text-ibbil-gold transition-colors hover:text-ibbil-gold-hover"
        >
          {{ t('auth.forgotPassword') }}
        </NuxtLinkLocale>
      </div>

      <BaseButton type="submit" variant="brand" block :loading="isLoading">
        <template v-if="!isLoading">
          {{ t('auth.login') }}
        </template>
        <template v-else>
          {{ t('common.loading') }}
        </template>
      </BaseButton>

      <p class="text-center text-sm text-foreground-muted">
        {{ t('auth.noAccount') }}
        <NuxtLinkLocale
          :to="ROUTES.AUTH.REGISTER"
          class="font-semibold text-ibbil-green underline-offset-4 transition-colors hover:text-ibbil-green-dark hover:underline"
        >
          {{ t('auth.register') }}
        </NuxtLinkLocale>
      </p>
    </form>
  </div>
</template>
