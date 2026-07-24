<script setup lang="ts">
import { ROUTES } from '@shared/constants/routes'
import type {
  ServiceLandingBenefit,
  ServiceLandingHeroSlide,
  ServiceLandingHowImage,
  ServiceLandingStep,
} from '@shared/components/site/ServiceLandingSection.vue'

const heroSlides: ServiceLandingHeroSlide[] = [
  { src: '/images/permits/hero.png', width: 1024, height: 341, altKey: 'hero' },
  {
    src: '/images/permits/service-content.png',
    width: 1024,
    height: 682,
    altKey: 'service',
  },
]

const benefits: ServiceLandingBenefit[] = [
  { key: 'digital', icon: 'lucide:file-badge' },
  { key: 'track', icon: 'lucide:clipboard-list' },
  { key: 'verified', icon: 'lucide:shield-check' },
]

const steps: ServiceLandingStep[] = [
  {
    key: 'submit',
    icon: 'lucide:file-pen-line',
    image: {
      src: '/images/permits/how-to-apply.png',
      width: 1024,
      height: 682,
      altKey: 'howToApply',
    },
  },
  {
    key: 'review',
    icon: 'lucide:search-check',
    image: {
      src: '/images/permits/service-content.png',
      width: 1024,
      height: 682,
      altKey: 'service',
    },
  },
  {
    key: 'receive',
    icon: 'lucide:badge-check',
    image: {
      src: '/images/permits/approved-document.png',
      width: 1024,
      height: 682,
      altKey: 'approved',
    },
  },
]

const howSectionImage: ServiceLandingHowImage = {
  src: '/images/permits/how-to-apply.png',
  width: 1024,
  height: 682,
  altKey: 'howToApply',
}
</script>

<template>
  <ServiceLandingSection
    i18n-prefix="site.permits"
    title-id="permits-title"
    :cta-primary-to="ROUTES.AUTH.LOGIN"
    :hero-slides="heroSlides"
    :benefits="benefits"
    :steps="steps"
    :how-section-image="howSectionImage"
  />
</template>
