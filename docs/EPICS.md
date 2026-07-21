# Ibble Website — Epics & Estimates

## Epic 0 — Project bootstrap & tooling

**Estimate:** 12 ساعة

| # | Task / Subtask | Hours |
|---|----------------|-------|
| 0.1 | إنشاء مشروع Nuxt 4 + TypeScript + Vue 3 | 1.5 |
| 0.1.1 | nuxi init، srcDir، path aliases (@core, @shared, @modules) | 0.5 |
| 0.1.2 | ضبط nuxt.config (modules, SSR rules, runtimeConfig) | 1 |
| 0.2 | تثبيت وإعداد Dependencies | 2 |
| 0.2.1 | Runtime: Pinia, Vue Query, Axios, Vee-Validate, Zod, i18n, Tailwind 4, VueUse, dayjs, swiper, nuxt-security, SEO, fonts, icon, image, color-mode | 1 |
| 0.2.2 | Dev: ESLint, Prettier, Vitest, Playwright, Husky, Commitlint, lint-staged, types | 1 |
| 0.3 | هيكل المجلدات (module-first) | 2 |
| 0.3.1 | core/, shared/, modules/, layouts/, pages/, plugins/, assets/ | 1 |
| 0.3.2 | Convention لكل module: api/services/composables/components/stores/types/schemas/pages | 1 |
| 0.4 | Env & config | 1.5 |
| 0.4.1 | .env.example (apiBaseUrl, auth, web, insurance, HyperPay, Maps, WhatsApp) | 0.5 |
| 0.4.2 | config/pages.ts لتسجيل صفحات الـ modules | 1 |
| 0.5 | Quality tooling | 2 |
| 0.5.1 | ESLint + Prettier + typecheck scripts | 1 |
| 0.5.2 | Husky + Commitlint + lint-staged | 1 |
| 0.6 | Git/README أساسي + تشغيل أول dev ناجح | 1 |

## Epic 1 — Design system & theming

**Estimate:** 28 ساعة

| # | Task / Subtask | Hours |
|---|----------------|-------|
| 1.1 | Design tokens (CSS variables) + Tailwind theme | 3 |
| 1.1.1 | Brand colors (green/gold)، dark mode، RTL-aware utilities | 2 |
| 1.1.2 | Fonts: Tajawal (AR) + Inter (EN) عبر @nuxt/fonts | 1 |
| 1.2 | Form primitives | 8 |
| 1.2.1 | BaseInput, BaseTextarea, BaseSelect, BaseCheckbox, BaseRadio | 3 |
| 1.2.2 | BasePhoneInput, BaseDatePicker, BaseFileUpload, BaseSearchInput | 3.5 |
| 1.2.3 | ربط Vee-Validate patterns مشتركة | 1.5 |
| 1.3 | Feedback & overlays | 5 |
| 1.3.1 | BaseModal, BaseDialog, BaseConfirmDialog, toast system | 3 |
| 1.3.2 | BaseLoader, BaseSkeleton, BaseEmptyState, BaseErrorState | 2 |
| 1.4 | Data display | 5 |
| 1.4.1 | BaseButton, BaseBadge, BaseAvatar, BaseCard, BaseTabs, BaseTooltip, BaseDropdown | 2.5 |
| 1.4.2 | BaseTable / BaseDataTable, BasePagination, BaseBreadcrumb | 2 |
| 1.4.3 | MoneyAmount, SaudiRiyalSymbol, BaseCountUp, BaseStatCard | 0.5 |
| 1.5 | Media & motion helpers | 3 |
| 1.5.1 | BaseImage, BaseImageGallery, BaseSwiper, DirectionalArrow | 2 |
| 1.5.2 | BaseStepper, FormWizardShell | 1 |
| 1.6 | Shared utils/composables للـ UI | 4 |
| 1.6.1 | cn, formatters (date/money), debounce, storage, IBAN, national-id | 2 |
| 1.6.2 | useToast, useModal, useDialog, usePagination, useFilters, useSearch, useDebounce, useGoToFirstError | 2 |

## Epic 2 — Core platform (HTTP, auth core, i18n, layouts)

**Estimate:** 22 ساعة

| # | Task / Subtask | Hours |
|---|----------------|-------|
| 2.1 | HTTP layer (Axios) | 6 |
| 2.1.1 | Client factory + multi-base URLs (marketplace / auth / web / insurance) | 2 |
| 2.1.2 | Interceptors (auth token, locale headers, error mapping) | 2.5 |
| 2.1.3 | base-service + crud-service abstractions | 1.5 |
| 2.2 | Auth core (بدون UI) | 4 |
| 2.2.1 | Token storage + tokenManager | 1.5 |
| 2.2.2 | useAuthStore + Pinia persist + hydrate plugin | 1.5 |
| 2.2.3 | Middleware: auth, guest, permission, auth.global | 1 |
| 2.3 | i18n AR/EN + RTL | 5 |
| 2.3.1 | إعداد @nuxtjs/i18n (prefix_except_default, ar default) | 1.5 |
| 2.3.2 | ملفات ar.json / en.json (هيكل namespaces) | 2 |
| 2.3.3 | LocaleSwitcher, useLocaleSwitch, locale-path helpers | 1.5 |
| 2.4 | Layouts & app shell | 4 |
| 2.4.1 | Layouts: default, site, auth, profile | 2 |
| 2.4.2 | Plugins: axios, vue-query, dayjs, pinia-persisted, auth-session | 2 |
| 2.5 | Security / SEO basics | 3 |
| 2.5.1 | nuxt-security CSP (HyperPay + Google Maps) | 1.5 |
| 2.5.2 | @nuxtjs/seo + routeRules (SSR off لـ auth/payment) | 1.5 |

## Epic 3 — Site chrome & marketing home

**Estimate:** 14 ساعة

| # | Task / Subtask | Hours |
|---|----------------|-------|
| 3.1 | SiteHeader, SiteFooter, SiteLogo, WhatsApp FAB | 4 |
| 3.2 | Home page sections (services, marketplace, about, stats) | 5 |
| 3.3 | Coming-soon pages (about, contact, media, terms, privacy, services) | 3 |
| 3.4 | Service stubs: transport / veterinary / permits + redirect insurance | 2 |

## Epic 4 — Auth UI & flows

**Estimate:** 16 ساعة

| # | Task / Subtask | Hours |
|---|----------------|-------|
| 4.1 | Auth API + service + Zod schemas | 3 |
| 4.2 | Login page + LoginForm | 3 |
| 4.3 | Register page + RegisterForm + pending registration storage | 3.5 |
| 4.4 | OTP page + OtpForm | 3 |
| 4.5 | Guest redirects + post-login redirect helpers | 1.5 |
| 4.6 | (اختياري لاحقاً) Forgot/Reset password pages | 2 |

## Epic 5 — Shared Maps package

**Estimate:** 10 ساعة

| # | Task / Subtask | Hours |
|---|----------------|-------|
| 5.1 | Google Maps script loader + GoogleMapsService | 3 |
| 5.2 | useGoogleMaps composable | 2 |
| 5.3 | PlaceAutocomplete | 2.5 |
| 5.4 | TripRoutePicker (origin/destination/distance) | 2.5 |

## Epic 6 — Shared Payment (HyperPay)

**Estimate:** 14 ساعة

| # | Task / Subtask | Hours |
|---|----------------|-------|
| 6.1 | Payment types + provider abstraction + HyperPay adapter | 4 |
| 6.2 | usePayment + payment.store + pending payment storage | 3 |
| 6.3 | PaymentModal / PaymentModalHost | 3.5 |
| 6.4 | /payment/callback (postMessage + return handling) | 3.5 |

## Epic 7 — Marketplace (Stores)

**Estimate:** 24 ساعة

| # | Task / Subtask | Hours |
|---|----------------|-------|
| 7.1 | Types, API, services, mappers, query keys | 4 |
| 7.2 | Categories list (/stores) + toolbar + cards | 4 |
| 7.3 | Category stores list (/stores/[slug]) | 3.5 |
| 7.4 | Store profile (/stores/[slug]/[storeSlug]) | 5 |
| 7.4.1 | Hero, about, stats, product categories | 2.5 |
| 7.4.2 | Products grid + skeletons | 2.5 |

---

**Total (Epics 0–7):** ~140 ساعة
