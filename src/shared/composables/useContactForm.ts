import { CONTACT_INFO } from '@shared/constants/contact'
import { DEFAULT_COUNTRY_CODE } from '@shared/constants/country-codes'
import { contactSchema, type ContactFormField, type ContactFormValues } from '@shared/schemas/contact.schema'
import { goToFirstError } from '@shared/utils/go-to-first-error'
import { buildMailtoHref, openMailto } from '@shared/utils/mailto'

function createEmptyForm(): ContactFormValues {
  return {
    name: '',
    email: '',
    phone: '',
    countryCode: DEFAULT_COUNTRY_CODE.apiCode,
    subject: '',
    message: '',
  }
}

function buildContactEmailBody(values: ContactFormValues, locale: string) {
  const phone = `${values.countryCode}${values.phone}`

  if (locale === 'ar') {
    return [
      'تم إرسال رسالة عبر نموذج تواصل معنا في منصة إبل:',
      '',
      `الاسم: ${values.name}`,
      `البريد: ${values.email}`,
      `الهاتف: ${phone}`,
      `الموضوع: ${values.subject}`,
      '',
      'الرسالة:',
      values.message,
    ].join('\n')
  }

  return [
    'New message from the Ibbil Contact Us form:',
    '',
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    `Phone: ${phone}`,
    `Subject: ${values.subject}`,
    '',
    'Message:',
    values.message,
  ].join('\n')
}

/**
 * Contact form state + validation.
 * Opens the user's mail client to `CONTACT_INFO.email` via mailto.
 */
export function useContactForm() {
  const { t, locale } = useI18n()
  const toast = useToast()

  const form = reactive(createEmptyForm())
  const fieldErrors = reactive<Partial<Record<ContactFormField, string>>>({})
  const submitting = ref(false)
  const submitted = ref(false)

  function clearFieldErrors() {
    fieldErrors.name = undefined
    fieldErrors.email = undefined
    fieldErrors.phone = undefined
    fieldErrors.countryCode = undefined
    fieldErrors.subject = undefined
    fieldErrors.message = undefined
  }

  function applyZodErrors(issues: { path: PropertyKey[]; message: string }[]) {
    clearFieldErrors()
    for (const issue of issues) {
      const field = String(issue.path[0] ?? '') as ContactFormField
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = t(issue.message)
      }
    }
  }

  function validateField(field: ContactFormField) {
    fieldErrors[field] = undefined
    const validation = contactSchema.safeParse(form)
    if (!validation.success) {
      const issue = validation.error.issues.find((item) => String(item.path[0]) === field)
      if (issue) fieldErrors[field] = t(issue.message)
    }
  }

  function openSupportEmail(values: ContactFormValues) {
    const href = buildMailtoHref({
      to: CONTACT_INFO.email,
      subject: values.subject,
      body: buildContactEmailBody(values, String(locale.value)),
    })

    if (!href) return false
    return openMailto(href)
  }

  async function handleSubmit() {
    if (submitting.value) return

    const validation = contactSchema.safeParse({ ...form })

    if (!validation.success) {
      applyZodErrors(validation.error.issues)
      await goToFirstError({ root: '[data-contact-form]' })
      return
    }

    submitting.value = true
    try {
      if (!openSupportEmail(validation.data)) {
        toast.error(t('site.contact.submitError'))
        return
      }

      submitted.value = true
      toast.success(t('site.contact.submitSuccess'))
    } finally {
      submitting.value = false
    }
  }

  function reset() {
    Object.assign(form, createEmptyForm())
    clearFieldErrors()
    submitted.value = false
  }

  return {
    form,
    fieldErrors,
    submitting,
    submitted,
    validateField,
    handleSubmit,
    reset,
  }
}
