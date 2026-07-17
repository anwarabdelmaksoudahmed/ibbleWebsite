<script setup lang="ts">
import { ROUTES } from '@shared/constants/routes'

type InsuranceBenefit = {
  key: 'owners' | 'transport' | 'bestPlans'
  icon: string
}

type InsuranceStep = {
  key: 'request' | 'review' | 'issue'
  icon: string
  image?: {
    src: string
    width: number
    height: number
    altKey: 'policyReview' | 'payment' | 'howToApply'
  }
}

const { t } = useI18n()
const localePath = useLocalePath()

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

type InsuranceHeroSlide = {
  src: string
  width: number
  height: number
  altKey: 'hero'
}

const heroSlides: InsuranceHeroSlide[] = [
  { src: '/images/insurance/hero.png', width: 1349, height: 410, altKey: 'hero' },
]

const benefits: InsuranceBenefit[] = [
  { key: 'owners', icon: 'lucide:shield-check' },
  { key: 'transport', icon: 'lucide:truck' },
  { key: 'bestPlans', icon: 'lucide:badge-check' },
]

const steps: InsuranceStep[] = [
  {
    key: 'request',
    icon: 'lucide:file-text',
    image: {
      src: '/images/insurance/how-to-apply.png',
      width: 480,
      height: 320,
      altKey: 'howToApply',
    },
  },
  {
    key: 'review',
    icon: 'lucide:clipboard-check',
    image: {
      src: '/images/insurance/policy-content.png',
      width: 549,
      height: 366,
      altKey: 'policyReview',
    },
  },
  {
    key: 'issue',
    icon: 'lucide:shield',
    image: {
      src: '/images/insurance/payment-methods.png',
      width: 480,
      height: 320,
      altKey: 'payment',
    },
  },
]

useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    if (entry?.isIntersecting) isVisible.value = true
  },
  { threshold: 0.08, rootMargin: '0px 0px -5% 0px' },
)

function goToLogin() {
  return navigateTo(localePath(ROUTES.AUTH.LOGIN))
}
</script>

<template>
  <section ref="sectionRef" class="bg-[#f4f6f5]" aria-labelledby="insurance-title" :data-visible="isVisible">
    <BaseSwiper
      :items="heroSlides"
      effect="fade"
      loop
      ken-burns
      :autoplay="{ delay: 5600, pauseOnMouseEnter: true }"
      controls-variant="brand"
      controls-position="overlay-bottom"
      :label="t('common.swiper.label')"
      class="!h-[410px] sm:h-screen"
    >
      <template #slide="{ item, index }">
        <div class="relative h-full w-full bg-ibbil-green-dark">
          <img
            :src="item.src"
            :alt="t(`site.insurance.images.${item.altKey}`)"
            class="absolute inset-0 h-full w-full object-cover object-[center_35%] sm:object-center"
            :width="item.width"
            :height="item.height"
            :loading="index === 0 ? 'eager' : 'lazy'"
            :fetchpriority="index === 0 ? 'high' : 'auto'"
            decoding="async"
          >
        </div>
      </template>

      <template #overlay>
        <div class="relative flex h-full items-center">
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-l from-ibbil-green-dark/25 via-ibbil-green-dark/55 to-ibbil-green-dark/88"
            aria-hidden="true"
          />
          <div
            class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,_rgba(212,160,68,0.22),_transparent_50%)]"
            aria-hidden="true"
          />

          <div class="relative z-[1] mx-auto w-full max-w-7xl px-4 py-10 pb-28 pointer-events-auto sm:px-6 sm:py-12 sm:pb-32 lg:px-6">
            <div class="max-w-2xl">
              <p class="insurance-fade text-xs font-semibold tracking-[0.22em] text-ibbil-gold uppercase sm:text-sm">
                {{ t('auth.platformName') }}
              </p>
              <h1
                id="insurance-title"
                class="insurance-fade mt-3 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl"
              >
                {{ t('site.insurance.heroTitle') }}
              </h1>
              <p class="insurance-fade mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                {{ t('site.insurance.heroSubtitle') }}
              </p>
              <div class="insurance-fade mt-6 flex flex-wrap items-center gap-3">
                <BaseButton
                  variant="brand"
                  class="!rounded-lg !bg-ibbil-gold !px-5 !py-2.5 !text-sm !font-bold !text-ibbil-green-dark !shadow-md !shadow-black/20 hover:!bg-ibbil-gold-hover hover:!shadow-lg"
                  @click="goToLogin"
                >
                  {{ t('site.insurance.ctaPrimary') }}
                  <DirectionalArrow animated />
                </BaseButton>
                <NuxtLinkLocale
                  to="/terms"
                  class="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  {{ t('site.insurance.ctaSecondary') }}
                </NuxtLinkLocale>
              </div>
            </div>
          </div>
        </div>
      </template>
    </BaseSwiper>

    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-6 lg:py-16">

      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-5">
        <BaseCard
          v-for="(benefit, index) in benefits"
          :key="benefit.key"
          :padding="false"
          class="insurance-fade h-full border-ibbil-green/10 bg-white/95"
          :style="isVisible ? { animationDelay: `${120 + index * 90}ms` } : undefined"
        >
          <div class="p-5 sm:p-6">
            <span class="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ibbil-green/8 text-ibbil-green">
              <Icon :name="benefit.icon" class="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 class="text-lg font-bold tracking-tight text-ibbil-green">
              {{ t(`site.insurance.benefits.${benefit.key}.title`) }}
            </h2>
            <p class="mt-2 text-sm leading-relaxed text-foreground-muted">
              {{ t(`site.insurance.benefits.${benefit.key}.description`) }}
            </p>
          </div>
        </BaseCard>
      </div>

      <div class="mt-10 grid items-center gap-7 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ibbil-green/10 sm:p-6 lg:mt-14 lg:grid-cols-2 lg:gap-10 lg:p-8">
        <div class="insurance-fade space-y-4">
          <h2 class="text-2xl font-extrabold tracking-tight text-ibbil-green sm:text-3xl">
            {{ t('site.insurance.howTitle') }}
          </h2>
          <p class="text-sm leading-relaxed text-foreground-muted sm:text-base">
            {{ t('site.insurance.howDescription') }}
          </p>
          <BaseButton variant="brand" class="!rounded-lg !px-5 !py-2.5 !text-sm !font-bold" @click="goToLogin">
            {{ t('site.insurance.ctaPrimary') }}
            <DirectionalArrow animated />
          </BaseButton>
        </div>

        <BaseImage
          src="/images/insurance/how-to-apply.png"
          :alt="t('site.insurance.images.howToApply')"
          rounded="lg"
          object-fit="cover"
          width="480"
          height="320"
          class="insurance-fade w-full"
        />
      </div>

      <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-5">
        <BaseCard
          v-for="(step, index) in steps"
          :key="step.key"
          :padding="false"
          class="insurance-fade h-full border-ibbil-green/10 bg-white"
          :style="isVisible ? { animationDelay: `${250 + index * 100}ms` } : undefined"
        >
          <BaseImage
            v-if="step.image"
            :src="step.image.src"
            :alt="t(`site.insurance.images.${step.image.altKey}`)"
            rounded="lg"
            object-fit="cover"
            :width="step.image.width"
            :height="step.image.height"
            class="aspect-[3/2] w-full"
          />
          <div class="p-5 sm:p-6">
            <span class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-ibbil-gold/20 text-ibbil-green-dark">
              <Icon :name="step.icon" class="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 class="text-base font-bold tracking-tight text-ibbil-green">
              {{ t(`site.insurance.steps.${step.key}.title`) }}
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-foreground-muted">
              {{ t(`site.insurance.steps.${step.key}.description`) }}
            </p>
          </div>
        </BaseCard>
      </div>
    </div>

    <div class="relative mt-10 overflow-hidden bg-ibbil-gold text-ibbil-green-dark lg:mt-14 !h-[410px] sm:h-screen">
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden="true"
        style="
          background-image: radial-gradient(rgba(31, 58, 43, 0.08) 1px, transparent 1px);
          background-size: 22px 22px;
        "
      />

      <div class="relative mx-auto flex h-full max-w-7xl items-center px-4 py-10 sm:px-6 sm:py-12 lg:px-6">
        <div class="grid w-full items-center gap-5 lg:grid-cols-[1.3fr_auto]">
          <div class="insurance-fade">
            <p class="text-xs font-semibold tracking-[0.22em] text-ibbil-green-dark/70 uppercase sm:text-sm">
              {{ t('auth.platformName') }}
            </p>
            <h2 class="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {{ t('site.insurance.footerTitle') }}
            </h2>
            <div class="relative mt-3 flex h-3 w-24 items-center" aria-hidden="true">
              <span class="h-px w-full bg-ibbil-green-dark/20" />
              <span class="absolute h-1 w-10 origin-left rounded-full bg-ibbil-green-dark rtl:origin-right" />
            </div>
            <p class="mt-4 max-w-3xl text-sm leading-relaxed text-ibbil-green-dark/80 sm:text-base">
              {{ t('site.insurance.footerDescription') }}
            </p>
          </div>
          <BaseButton
            variant="brand"
            class="insurance-fade !rounded-lg !px-5 !py-2.5 !text-sm !font-bold lg:justify-self-start"
            @click="goToLogin"
          >
            {{ t('site.insurance.ctaPrimary') }}
            <DirectionalArrow animated />
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.insurance-fade {
  opacity: 0;
  transform: translateY(14px);
}

[aria-labelledby='insurance-title'][data-visible='true'] .insurance-fade {
  animation: insurance-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes insurance-fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  [aria-labelledby='insurance-title'][data-visible='true'] .insurance-fade {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
