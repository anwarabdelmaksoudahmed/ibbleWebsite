<script setup lang="ts">
import { VETERINARY_ROUTES } from '@modules/veterinary/constants/routes'
import type {
  ServiceLandingBenefit,
  ServiceLandingHeroSlide,
  ServiceLandingHowImage,
  ServiceLandingStep,
} from '@shared/components/site/ServiceLandingSection.vue'

const heroSlides: ServiceLandingHeroSlide[] = [
  { src: '/images/veterinary/hero.png', width: 1024, height: 341, altKey: 'hero' },
  {
    src: '/images/veterinary/care-content.png',
    width: 1024,
    height: 643,
    altKey: 'careContent',
  },
]

const benefits: ServiceLandingBenefit[] = [
  { key: 'clinic', icon: 'lucide:stethoscope' },
  { key: 'fieldVisit', icon: 'lucide:home' },
  { key: 'consultation', icon: 'lucide:pill' },
]

const steps: ServiceLandingStep[] = [
  {
    key: 'chooseService',
    icon: 'lucide:list-checks',
    image: {
      src: '/images/veterinary/care-content.png',
      width: 549,
      height: 345,
      altKey: 'careContent',
    },
  },
  {
    key: 'chooseDate',
    icon: 'lucide:calendar-days',
    image: {
      src: '/images/veterinary/how-to-book.png',
      width: 480,
      height: 320,
      altKey: 'howToBook',
    },
  },
  {
    key: 'confirm',
    icon: 'lucide:badge-check',
    image: {
      src: '/images/veterinary/hero.png',
      width: 480,
      height: 320,
      altKey: 'hero',
    },
  },
]

const howSectionImage: ServiceLandingHowImage = {
  src: '/images/veterinary/how-to-book.png',
  width: 480,
  height: 320,
  altKey: 'howToBook',
}
</script>

<template>
  <ServiceLandingSection
    i18n-prefix="site.veterinary"
    title-id="veterinary-title"
    :cta-primary-to="VETERINARY_ROUTES.BOOK"
    :hero-slides="heroSlides"
    :benefits="benefits"
    :steps="steps"
    :how-section-image="howSectionImage"
  />
</template>
