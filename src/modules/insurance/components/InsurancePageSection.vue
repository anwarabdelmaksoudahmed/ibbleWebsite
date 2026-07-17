<script setup lang="ts">
import { INSURANCE_ROUTES } from '@modules/insurance/constants/routes'
import type {
  ServiceLandingBenefit,
  ServiceLandingHeroSlide,
  ServiceLandingHowImage,
  ServiceLandingStep,
} from '@shared/components/site/ServiceLandingSection.vue'

const heroSlides: ServiceLandingHeroSlide[] = [
  { src: '/images/insurance/hero.png', width: 1349, height: 410, altKey: 'hero' },
]

const benefits: ServiceLandingBenefit[] = [
  { key: 'owners', icon: 'lucide:shield-check' },
  { key: 'transport', icon: 'lucide:truck' },
  { key: 'bestPlans', icon: 'lucide:badge-check' },
]

const steps: ServiceLandingStep[] = [
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

const howSectionImage: ServiceLandingHowImage = {
  src: '/images/insurance/how-to-apply.png',
  width: 480,
  height: 320,
  altKey: 'howToApply',
}
</script>

<template>
  <ServiceLandingSection
    i18n-prefix="site.insurance"
    title-id="insurance-title"
    :cta-primary-to="INSURANCE_ROUTES.REGISTER"
    :hero-slides="heroSlides"
    :benefits="benefits"
    :steps="steps"
    :how-section-image="howSectionImage"
  />
</template>
