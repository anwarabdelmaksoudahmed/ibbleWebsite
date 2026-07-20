<script setup lang="ts">
import type {
  ServiceLandingBenefit,
  ServiceLandingHeroSlide,
  ServiceLandingHowImage,
  ServiceLandingStep,
} from '@shared/components/site/ServiceLandingSection.vue'
import { TRANSPORT_ROUTES } from '@modules/transport/constants/routes'

const heroSlides: ServiceLandingHeroSlide[] = [
  { src: '/images/transport/hero.png', width: 1349, height: 410, altKey: 'hero' },
  {
    src: '/images/transport/service-content.png',
    width: 500,
    height: 400,
    altKey: 'service',
  },
]

const benefits: ServiceLandingBenefit[] = [
  { key: 'choice', icon: 'lucide:sliders-horizontal' },
  { key: 'audience', icon: 'lucide:users' },
  { key: 'price', icon: 'lucide:hand-coins' },
]

const steps: ServiceLandingStep[] = [
  {
    key: 'choose',
    icon: 'lucide:truck',
    image: {
      src: '/images/transport/service-content.png',
      width: 500,
      height: 400,
      altKey: 'service',
    },
  },
  {
    key: 'negotiate',
    icon: 'lucide:messages-square',
    image: {
      src: '/images/transport/how-to-book.png',
      width: 480,
      height: 320,
      altKey: 'howToBook',
    },
  },
  {
    key: 'book',
    icon: 'lucide:map-pinned',
    image: {
      src: '/images/transport/hero.png',
      width: 480,
      height: 320,
      altKey: 'hero',
    },
  },
]

const howSectionImage: ServiceLandingHowImage = {
  src: '/images/transport/how-to-book.png',
  width: 480,
  height: 320,
  altKey: 'howToBook',
}
</script>

<template>
  <ServiceLandingSection
    i18n-prefix="site.transport"
    title-id="transport-title"
    :cta-primary-to="TRANSPORT_ROUTES.REGISTER"
    :hero-slides="heroSlides"
    :benefits="benefits"
    :steps="steps"
    :how-section-image="howSectionImage"
  />
</template>
