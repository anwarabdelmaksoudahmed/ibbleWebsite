<script setup lang="ts">
import {
  CONTACT_INFO,
  CONTACT_MAP_EMBED_SRC,
  CONTACT_MAP_EXTERNAL_HREF,
} from '@shared/constants/contact'
import { useContactForm } from '@shared/composables/useContactForm'

const { t } = useI18n()

const {
  form,
  fieldErrors,
  submitting,
  submitted,
  validateField,
  handleSubmit,
  reset,
} = useContactForm()

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const mapVisible = ref(false)

useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    if (entry?.isIntersecting) isVisible.value = true
  },
  { threshold: 0.08, rootMargin: '0px 0px -4% 0px' },
)

const mapHostRef = ref<HTMLElement | null>(null)
useIntersectionObserver(
  mapHostRef,
  ([entry]) => {
    if (entry?.isIntersecting) mapVisible.value = true
  },
  { rootMargin: '120px 0px' },
)

const contactItems = computed(() => [
  {
    key: 'address',
    icon: 'lucide:map-pin',
    label: t('site.contact.info.addressLabel'),
    value: t('site.contact.info.addressValue'),
    href: CONTACT_MAP_EXTERNAL_HREF,
    external: true,
  },
  {
    key: 'phone',
    icon: 'lucide:phone',
    label: t('site.contact.info.phoneLabel'),
    value: CONTACT_INFO.phone,
    href: `tel:${CONTACT_INFO.phone}`,
    external: false,
    dir: 'ltr' as const,
  },
  {
    key: 'email',
    icon: 'lucide:mail',
    label: t('site.contact.info.emailLabel'),
    value: CONTACT_INFO.email,
    href: `mailto:${CONTACT_INFO.email}`,
    external: false,
    dir: 'ltr' as const,
  },
])
</script>

<template>
  <section
    ref="sectionRef"
    class="relative px-4 py-10 sm:px-6 sm:py-14 lg:px-6 lg:py-16"
    aria-labelledby="contact-title"
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(212,160,68,0.12),transparent_65%)]"
      aria-hidden="true"
    />

    <div
      class="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white shadow-[0_24px_60px_-36px_rgba(45,83,61,0.45)]"
      :class="isVisible ? 'contact-reveal' : 'opacity-0'"
    >
      <div class="px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <header class="mb-10 text-center sm:mb-12">
          <h1
            id="contact-title"
            class="text-3xl font-extrabold tracking-tight text-ibbil-green sm:text-4xl"
          >
            {{ t('site.contact.title') }}
          </h1>
          <div class="relative mx-auto mt-4 flex h-3 w-28 items-center justify-center" aria-hidden="true">
            <span class="h-px w-full bg-ibbil-green/25" />
            <span
              class="absolute h-1 w-10 rounded-full bg-ibbil-gold"
              :class="isVisible ? 'contact-accent' : 'scale-x-0'"
            />
          </div>
          <p class="mx-auto mt-4 max-w-xl text-sm leading-7 text-foreground-muted sm:text-base">
            {{ t('site.contact.subtitle') }}
          </p>
        </header>

        <div class="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <div
            class="order-2 space-y-5 lg:order-1 lg:col-span-5"
            :class="isVisible ? 'contact-reveal' : 'opacity-0'"
            :style="isVisible ? { animationDelay: '80ms' } : undefined"
          >
            <ul class="space-y-5" role="list">
              <li
                v-for="(item, index) in contactItems"
                :key="item.key"
                class="flex gap-3"
                :class="isVisible ? 'contact-reveal' : 'opacity-0'"
                :style="isVisible ? { animationDelay: `${120 + index * 70}ms` } : undefined"
              >
                <span
                  class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-ibbil-green/8 text-ibbil-green"
                  aria-hidden="true"
                >
                  <Icon :name="item.icon" class="size-5" />
                </span>
                <div class="min-w-0 space-y-0.5">
                  <p class="text-sm font-bold text-ibbil-green">{{ item.label }}</p>
                  <a
                    :href="item.href"
                    class="block text-sm leading-6 text-foreground-muted transition-colors hover:text-ibbil-green"
                    :dir="item.dir"
                    :target="item.external ? '_blank' : undefined"
                    :rel="item.external ? 'noopener noreferrer' : undefined"
                  >
                    {{ item.value }}
                  </a>
                </div>
              </li>
            </ul>
          </div>

          <div
            ref="mapHostRef"
            class="order-1 overflow-hidden rounded-2xl border border-ibbil-green/10 bg-[#fafbfa] lg:order-2 lg:col-span-7"
            :class="isVisible ? 'contact-reveal' : 'opacity-0'"
            :style="isVisible ? { animationDelay: '140ms' } : undefined"
          >
            <div class="relative aspect-[16/11] w-full sm:aspect-[16/10]">
              <iframe
                v-if="mapVisible"
                :title="t('site.contact.mapTitle')"
                :src="CONTACT_MAP_EMBED_SRC"
                class="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                allowfullscreen
              />
              <div
                v-else
                class="absolute inset-0 flex items-center justify-center bg-ibbil-green/[0.03]"
                aria-hidden="true"
              >
                <Icon name="lucide:map" class="size-10 text-ibbil-green/25" />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-10 border-t border-ibbil-green/10 pt-8 sm:mt-12 sm:pt-10">
          <Transition
            mode="out-in"
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div
              v-if="submitted"
              key="success"
              class="mx-auto max-w-md px-2 py-8 text-center"
              role="status"
            >
              <div
                class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-ibbil-green/10 text-ibbil-green"
              >
                <Icon name="lucide:mail-check" class="size-7" aria-hidden="true" />
              </div>
              <!-- <h2 class="text-xl font-bold text-ibbil-green">
                {{ t('site.contact.successTitle') }}
              </h2>
              <p class="mt-2 text-sm leading-7 text-foreground-muted">
                {{ t('site.contact.successDescription') }}
              </p> -->
              <BaseButton
                variant="brand"
                class="mt-6 min-w-[10rem]"
                type="button"
                @click="reset"
              >
                {{ t('site.contact.sendAnother') }}
              </BaseButton>
            </div>

            <form
              v-else
              key="form"
              class="space-y-5"
              data-contact-form
              novalidate
              @submit.prevent="handleSubmit"
            >
              <div class="grid gap-5 sm:grid-cols-2">
                <BaseInput
                  v-model="form.name"
                  :label="t('site.contact.form.name')"
                  :placeholder="t('site.contact.form.name')"
                  :error="fieldErrors.name"
                  autocomplete="name"
                  name="name"
                  required
                  @blur="validateField('name')"
                />
                <BaseInput
                  v-model="form.email"
                  type="email"
                  dir="ltr"
                  :label="t('site.contact.form.email')"
                  :placeholder="t('site.contact.form.email')"
                  :error="fieldErrors.email"
                  autocomplete="email"
                  name="email"
                  required
                  @blur="validateField('email')"
                />
              </div>

              <div class="grid gap-5 sm:grid-cols-2">
                <BasePhoneInput
                  v-model:phone="form.phone"
                  v-model:country-code="form.countryCode"
                  :label="t('site.contact.form.phone')"
                  :error="fieldErrors.phone"
                  :country-error="fieldErrors.countryCode"
                  :country-aria-label="t('site.contact.form.countryCode')"
                  required
                  @blur="validateField('phone')"
                  @country-change="validateField('countryCode')"
                />
                <BaseInput
                  v-model="form.subject"
                  :label="t('site.contact.form.subject')"
                  :placeholder="t('site.contact.form.subject')"
                  :error="fieldErrors.subject"
                  autocomplete="off"
                  name="subject"
                  required
                  @blur="validateField('subject')"
                />
              </div>

              <BaseTextarea
                v-model="form.message"
                :label="t('site.contact.form.message')"
                :placeholder="t('site.contact.form.message')"
                :error="fieldErrors.message"
                :rows="6"
                name="message"
                required
                @blur="validateField('message')"
              />

              <div class="flex flex-col items-center gap-2 pt-2">
                <BaseButton
                  type="submit"
                  variant="brand"
                  class="min-w-[9.5rem] px-10"
                  :loading="submitting"
                  :disabled="submitting"
                >
                  {{ t('site.contact.form.submit') }}
                </BaseButton>
                <p class="text-xs text-foreground-muted">
                  {{ t('site.contact.form.submitHint', { email: CONTACT_INFO.email }) }}
                </p>
              </div>
            </form>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-reveal {
  animation: contact-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.contact-accent {
  animation: contact-scale-x 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
}

@keyframes contact-fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes contact-scale-x {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .contact-reveal,
  .contact-accent {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
