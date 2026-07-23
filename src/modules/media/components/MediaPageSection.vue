<script setup lang="ts">
import { MEDIA_ROUTES } from '@modules/media/constants/routes'
import MediaLatestFeed from '@modules/media/components/MediaLatestFeed.vue'
import type {
  ServiceLandingBenefit,
  ServiceLandingHeroSlide,
  ServiceLandingHowImage,
  ServiceLandingStep,
} from '@shared/components/site/ServiceLandingSection.vue'

const heroSlides: ServiceLandingHeroSlide[] = [
  { src: '/images/media/hero-caravan.jpg', width: 1024, height: 882, altKey: 'caravan' },
  { src: '/images/media/hero-heritage.jpg', width: 1024, height: 882, altKey: 'heritage' },
  { src: '/images/media/hero-digital.jpg', width: 1024, height: 882, altKey: 'digital' },
  { src: '/images/media/hero-camel.jpg', width: 1024, height: 882, altKey: 'camel' },
  { src: '/images/media/hero-veterinary.jpg', width: 1024, height: 883, altKey: 'veterinary' },
]

const benefits: ServiceLandingBenefit[] = [
  { key: 'news', icon: 'lucide:newspaper', to: MEDIA_ROUTES.NEWS },
  { key: 'photos', icon: 'lucide:images', to: MEDIA_ROUTES.PHOTOS },
  { key: 'videos', icon: 'lucide:clapperboard', to: MEDIA_ROUTES.VIDEOS },
  { key: 'events', icon: 'lucide:calendar-days', to: MEDIA_ROUTES.EVENTS },
]

const steps: ServiceLandingStep[] = [
  {
    key: 'browse',
    icon: 'lucide:layout-grid',
    image: {
      src: '/images/media/hero-digital.jpg',
      width: 1024,
      height: 882,
      altKey: 'digital',
    },
  },
  {
    key: 'explore',
    icon: 'lucide:images',
    image: {
      src: '/images/media/hero-heritage.jpg',
      width: 1024,
      height: 882,
      altKey: 'heritage',
    },
  },
  {
    key: 'watch',
    icon: 'lucide:play-circle',
    image: {
      src: '/images/media/hero-caravan.jpg',
      width: 1024,
      height: 882,
      altKey: 'caravan',
    },
  },
]

const howSectionImage: ServiceLandingHowImage = {
  src: '/images/media/hero-camel.jpg',
  width: 1024,
  height: 882,
  altKey: 'camel',
}
</script>

<template>
  <ServiceLandingSection
    i18n-prefix="site.media"
    title-id="media-hub-title"
    :cta-primary-to="MEDIA_ROUTES.NEWS"
    :cta-secondary-to="MEDIA_ROUTES.PHOTOS"
    :hero-slides="heroSlides"
    :benefits="benefits"
    :steps="steps"
    :how-section-image="howSectionImage"
  >
    <MediaLatestFeed />
  </ServiceLandingSection>
</template>
