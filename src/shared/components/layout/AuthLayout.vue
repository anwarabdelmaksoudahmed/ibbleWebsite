<script setup lang="ts">
import { ROUTES } from '@shared/constants/routes'

const { t } = useI18n()
const route = useRoute()


const alignTop = computed(() => route.meta.authContentAlign === 'top')
</script>

<template>
  
 
  <div class="relative flex min-h-screen overflow-x-clip bg-[#f3f1ec] lg:h-screen lg:overflow-y-hidden">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,160,68,0.14),_transparent_52%),radial-gradient(ellipse_at_bottom_left,_rgba(45,83,61,0.07),_transparent_48%)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.35]"
      aria-hidden="true"
      style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%232d533d\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
    />

    <div class="relative z-10 mx-auto flex w-full flex-1 flex-col lg:min-h-0 lg:flex-row lg:items-stretch">
      <aside class="auth-brand relative flex min-h-[42vh] flex-col justify-between overflow-hidden text-white sm:min-h-[48vh] lg:sticky lg:top-0 lg:h-screen lg:w-[46%]">
        <img
          src="/images/hero/camel-1.jpg"
          :alt="t('site.home.hero.slides.portrait')"
          class="auth-brand-image pointer-events-none absolute inset-0 h-full w-full object-cover object-[42%_center] lg:object-[38%_center]"
          width="1920"
          height="2560"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        >

        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ibbil-green-dark via-ibbil-green-dark/75 to-ibbil-green-dark/40 lg:bg-gradient-to-l lg:from-ibbil-green-dark/40 lg:via-ibbil-green-dark/68 lg:to-ibbil-green-dark/88"
          aria-hidden="true"
        />
        <div
          class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_rgba(212,160,68,0.28),_transparent_55%)]"
          aria-hidden="true"
        />
        <div
          class="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ibbil-green-dark/95 to-transparent lg:hidden"
          aria-hidden="true"
        />

        <div class="relative z-30 flex items-center justify-between gap-3 px-5 pt-6 sm:px-8 sm:pt-8 lg:px-12 lg:pt-12">
          <div class="auth-fade-in">
            <SiteLogo light size="md" />
          </div>
          <div class="auth-fade-in flex items-center gap-2" style="animation-delay: 80ms">
            <LocaleSwitcher variant="auth" />
            <NuxtLinkLocale
              :to="ROUTES.HOME"
              class="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <DirectionalArrow direction="back" size="xs" />
              {{ t('site.nav.home') }}
            </NuxtLinkLocale>
          </div>
        </div>

        <div class="relative z-[1] mt-auto space-y-4 px-5 pb-8 pt-16 sm:px-8 sm:pb-10 lg:my-0 lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 lg:pb-12 lg:pt-10">
          <p
            class="auth-fade-in text-xs font-semibold tracking-[0.22em] text-ibbil-gold uppercase"
            style="animation-delay: 120ms"
          >
            {{ t('auth.platformName') }}
          </p>

          <h1
            class="auth-fade-in max-w-md text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl"
            style="animation-delay: 180ms"
          >
            {{ t('auth.hero.title') }}
          </h1>

          <p
            class="auth-fade-in max-w-sm text-sm leading-relaxed text-white/80 sm:text-base"
            style="animation-delay: 240ms"
          >
            {{ t('auth.hero.subtitle') }}
          </p>


        </div>

        <p class="relative z-[1] hidden px-12 pb-10 text-xs text-white/55 lg:block">
          {{ t('auth.hero.rights') }} © {{ new Date().getFullYear() }}
        </p>
      </aside>

      <section
        class="auth-form-scroll relative flex flex-1 justify-center overscroll-contain px-4 py-8 sm:px-8 lg:h-screen lg:overflow-y-auto lg:py-12"
        :class="alignTop ? 'items-start' : 'items-center'"
      >
        <div class="auth-form-enter relative w-full">
          <slot />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.auth-form-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(45, 83, 61, 0.25) transparent;
}

.auth-form-scroll::-webkit-scrollbar {
  width: 6px;
}

.auth-form-scroll::-webkit-scrollbar-thumb {
  background: rgba(45, 83, 61, 0.25);
  border-radius: 999px;
}

.auth-brand-image {
  transform: scale(1.06);
  animation: auth-image-drift 18s ease-in-out infinite alternate;
  will-change: transform;
}

.auth-fade-in {
  animation: auth-fade-up 0.55s ease-out both;
}

.auth-form-enter {
  animation: auth-fade-up 0.6s ease-out both;
  animation-delay: 160ms;
}

@keyframes auth-fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes auth-image-drift {
  from {
    transform: scale(1.06) translate3d(0, 0, 0);
  }
  to {
    transform: scale(1.12) translate3d(-1.5%, 1%, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-brand-image,
  .auth-fade-in,
  .auth-form-enter {
    animation: none;
  }

  .auth-brand-image {
    transform: none;
  }
}
</style>
