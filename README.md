# Ibble Website

Nuxt 4 frontend for the Ibble platform.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` with your local API URLs if needed, then start the app:

```bash
npm run dev
```

## Environment

| File | Tracked? | Purpose |
|------|----------|---------|
| `.env.example` | yes | Template for all public config keys |
| `.env.development.example` | yes | Dev-oriented defaults |
| `.env.production.example` | yes | Production placeholders |
| `.env` | **no** | Your local overrides (create from example) |
| `.env.development` / `.env.production` | **no** | Optional mode-specific overrides |

Nuxt maps `NUXT_PUBLIC_*` into `useRuntimeConfig().public`.

| Variable | Description |
|----------|-------------|
| `NUXT_PUBLIC_APP_NAME` | App display name |
| `NUXT_PUBLIC_APP_URL` | Public site URL (SEO / absolute links) |
| `NUXT_PUBLIC_API_BASE_URL` | Marketplace API base URL |
| `NUXT_PUBLIC_AUTH_BASE_URL` | Auth service base URL |
| `NUXT_PUBLIC_WEB_API_BASE_URL` | Web API base URL |
| `NUXT_PUBLIC_INSURANCE_API_BASE_URL` | Insurance API base URL |
| `NUXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number without `+` |
| `NUXT_PUBLIC_HYPERPAY_WIDGET_BASE_URL` | HyperPay payment widget script URL |
| `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps browser key (Places + Directions) |

## Project layout

Module-first under `src/`:

- `core/` — platform primitives (HTTP, auth, middleware)
- `shared/` — shared UI, utils, composables
- `modules/{name}/` — feature modules (`api`, `services`, `composables`, `components`, `stores`, `types`, `schemas`, `pages`)
- `layouts/`, `pages/`, `plugins/`, `assets/`

Module pages are registered via `config/pages.ts`.

## Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run preview      # preview production build
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run format       # Prettier
npm run test:unit    # Vitest
npm run test:e2e     # Playwright
```

## Production

```bash
cp .env.production.example .env.production
# fill real production values, then:
npm run build
```
