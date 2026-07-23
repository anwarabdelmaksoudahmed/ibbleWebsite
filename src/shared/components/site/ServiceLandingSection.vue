<script setup lang="ts">
import { ROUTES } from '@shared/constants/routes'

export type ServiceLandingHeroSlide = {
  src: string
  width: number
  height: number
  altKey: string
}

export type ServiceLandingBenefit = {
  key: string
  icon: string
  /** Optional internal path — when set, the benefit card becomes a link. */
  to?: string
}

export type ServiceLandingStepImage = {
  src: string
  width: number
  height: number
  altKey: string
}

export type ServiceLandingStep = {
  key: string
  icon: string
  image?: ServiceLandingStepImage
}

export type ServiceLandingHowImage = {
  src: string
  width: number | string
  height: number | string
  altKey: string
}

const props = withDefaults(
  defineProps<{
    i18nPrefix: string
    titleId: string
    heroSlides: ServiceLandingHeroSlide[]
    benefits: ServiceLandingBenefit[]
    steps: ServiceLandingStep[]
    howSectionImage: ServiceLandingHowImage
    ctaPrimaryTo?: string
    ctaSecondaryTo?: string
  }>(),
  {
    ctaSecondaryTo: '/terms',
  },
)

const { t, te } = useI18n()
const localePath = useLocalePath()

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    if (entry?.isIntersecting) isVisible.value = true
  },
  { threshold: 0.08, rootMargin: '0px 0px -5% 0px' },
)

function goToPrimaryCta() {
  const target = props.ctaPrimaryTo ?? ROUTES.AUTH.LOGIN
  return navigateTo(localePath(target))
}

function tKey(suffix: string) {
  return t(`${props.i18nPrefix}.${suffix}`)
}

function tImageAlt(altKey: string) {
  return t(`${props.i18nPrefix}.images.${altKey}`)
}

function benefitExploreLabel() {
  const key = `${props.i18nPrefix}.exploreBenefit`
  return te(key) ? t(key) : t('site.home.exploreService')
}
</script>

<template>
  <section ref="sectionRef" class="bg-[#f4f6f5]" :aria-labelledby="titleId" :data-visible="isVisible">
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
            :alt="tImageAlt(item.altKey)"
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
              <!-- <p class="section-fade text-xs font-semibold tracking-[0.22em] text-ibbil-gold uppercase sm:text-sm">
                {{ t('auth.platformName') }}
              </p> -->
              <h1
                :id="titleId"
                class="section-fade mt-3 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl"
              >
                {{ tKey('heroTitle') }}
              </h1>
              <p class="section-fade mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                {{ tKey('heroSubtitle') }}
              </p>
              <div class="section-fade mt-6 flex flex-wrap items-center gap-3">
                <BaseButton
                  variant="brand"
                  class="!rounded-lg !bg-ibbil-gold !px-5 !py-2.5 !text-sm !font-bold !text-ibbil-green-dark !shadow-md !shadow-black/20 hover:!bg-ibbil-gold-hover hover:!shadow-lg"
                  @click="goToPrimaryCta"
                >
                  {{ tKey('ctaPrimary') }}
                  <DirectionalArrow animated />
                </BaseButton>
                <NuxtLinkLocale
                  :to="ctaSecondaryTo"
                  class="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  {{ tKey('ctaSecondary') }}
                </NuxtLinkLocale>
              </div>
            </div>
          </div>
        </div>
      </template>
    </BaseSwiper>

    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-6 lg:py-16">

      <div
        class="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:gap-5"
        :class="benefits.length > 3 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'"
      >
        <template v-for="(benefit, index) in benefits" :key="benefit.key">
          <NuxtLinkLocale
            v-if="benefit.to"
            :to="benefit.to"
            class="section-fade block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green focus-visible:ring-offset-2"
            :style="isVisible ? { animationDelay: `${120 + index * 90}ms` } : undefined"
          >
            <BaseCard
              :padding="false"
              class="h-full border-ibbil-green/10 bg-white/95 transition-all duration-300 hover:-translate-y-1 hover:border-ibbil-gold/45 hover:shadow-[0_18px_36px_-22px_rgba(45,83,61,0.45)]"
            >
              <div class="p-5 sm:p-6">
                <span class="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ibbil-green/8 text-ibbil-green">
                  <Icon :name="benefit.icon" class="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 class="text-lg font-bold tracking-tight text-ibbil-green">
                  {{ t(`${i18nPrefix}.benefits.${benefit.key}.title`) }}
                </h2>
                <p class="mt-2 text-sm leading-relaxed text-foreground-muted">
                  {{ t(`${i18nPrefix}.benefits.${benefit.key}.description`) }}
                </p>
                <span class="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-ibbil-green">
                  {{ benefitExploreLabel() }}
                  <DirectionalArrow variant="chevron" size="sm" animated />
                </span>
              </div>
            </BaseCard>
          </NuxtLinkLocale>

          <BaseCard
            v-else
            :padding="false"
            class="section-fade h-full border-ibbil-green/10 bg-white/95"
            :style="isVisible ? { animationDelay: `${120 + index * 90}ms` } : undefined"
          >
            <div class="p-5 sm:p-6">
              <span class="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ibbil-green/8 text-ibbil-green">
                <Icon :name="benefit.icon" class="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 class="text-lg font-bold tracking-tight text-ibbil-green">
                {{ t(`${i18nPrefix}.benefits.${benefit.key}.title`) }}
              </h2>
              <p class="mt-2 text-sm leading-relaxed text-foreground-muted">
                {{ t(`${i18nPrefix}.benefits.${benefit.key}.description`) }}
              </p>
            </div>
          </BaseCard>
        </template>
      </div>

      <div class="mt-10 grid items-center gap-7 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ibbil-green/10 sm:p-6 lg:mt-14 lg:grid-cols-2 lg:gap-10 lg:p-8">
        <div class="section-fade space-y-4">
          <h2 class="text-2xl font-extrabold tracking-tight text-ibbil-green sm:text-3xl">
            {{ tKey('howTitle') }}
          </h2>
          <p class="text-sm leading-relaxed text-foreground-muted sm:text-base">
            {{ tKey('howDescription') }}
          </p>
          <BaseButton variant="brand" class="!rounded-lg !px-5 !py-2.5 !text-sm !font-bold" @click="goToPrimaryCta">
            {{ tKey('ctaPrimary') }}
            <DirectionalArrow animated />
          </BaseButton>
        </div>

        <BaseImage
          :src="howSectionImage.src"
          :alt="tImageAlt(howSectionImage.altKey)"
          rounded="lg"
          object-fit="cover"
          :width="howSectionImage.width"
          :height="howSectionImage.height"
          class="section-fade w-full"
        />
      </div>

      <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-5">
        <BaseCard
          v-for="(step, index) in steps"
          :key="step.key"
          :padding="false"
          class="section-fade h-full border-ibbil-green/10 bg-white"
          :style="isVisible ? { animationDelay: `${250 + index * 100}ms` } : undefined"
        >
          <BaseImage
            v-if="step.image"
            :src="step.image.src"
            :alt="tImageAlt(step.image.altKey)"
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
              {{ t(`${i18nPrefix}.steps.${step.key}.title`) }}
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-foreground-muted">
              {{ t(`${i18nPrefix}.steps.${step.key}.description`) }}
            </p>
          </div>
        </BaseCard>
      </div>

      <div v-if="$slots.default" class="mt-10 lg:mt-14">
        <slot />
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
          <div class="section-fade">
            <p class="text-xs font-semibold tracking-[0.22em] text-ibbil-green-dark/70 uppercase sm:text-sm">
              {{ t('auth.platformName') }}
            </p>
            <h2 class="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {{ tKey('footerTitle') }}
            </h2>
            <div class="relative mt-3 flex h-3 w-24 items-center" aria-hidden="true">
              <span class="h-px w-full bg-ibbil-green-dark/20" />
              <span class="absolute h-1 w-10 origin-left rounded-full bg-ibbil-green-dark rtl:origin-right" />
            </div>
            <p class="mt-4 max-w-3xl text-sm leading-relaxed text-ibbil-green-dark/80 sm:text-base">
              {{ tKey('footerDescription') }}
            </p>
          </div>
          <BaseButton
            variant="brand"
            class="section-fade !rounded-lg !px-5 !py-2.5 !text-sm !font-bold lg:justify-self-start"
            @click="goToPrimaryCta"
          >
            {{ tKey('ctaPrimary') }}
            <DirectionalArrow animated />
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-fade {
  opacity: 0;
  transform: translateY(14px);
}

section[data-visible='true'] .section-fade {
  animation: section-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes section-fade-up {
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
  section[data-visible='true'] .section-fade {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
