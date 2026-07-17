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
| `NUXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number without `+` |
| `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps browser key (Places + Directions) |

### Shared Google Maps (`src/shared/maps`)

Reusable, framework-lean Maps layer (same idea as `shared/payment`):

- **Service** — `GoogleMapsService` (no Nuxt/Vue; portable to other projects)
- **Composable** — `useGoogleMaps()` wires `runtimeConfig` + locale
- **UI** — `PlaceAutocomplete`, `TripRoutePicker`

```ts
import { useGoogleMaps, createGoogleMapsService } from '@shared/maps'
// or components: <TripRoutePicker ... />
```


## Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run preview      # preview production build
npm run typecheck    # TypeScript check
npm run lint         # ESLint
```

## Production

```bash
cp .env.production.example .env.production
# fill real production values, then:
npm run build
```
