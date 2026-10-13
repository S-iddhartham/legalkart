# LegalKart Web — Home & Consult

Next.js 15 (App Router) + TypeScript + Tailwind rebuild of the LegalKart Home page, a new
Consult (lawyer discovery) screen, lawyer profile and service overview pages.

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE_URL to use the real API
npm run dev                  # http://localhost:3000
npm run lint && npm run typecheck && npm test && npm run build
```

## 1. Audit findings

This repository was **empty** when the work started (no commits, no source). The production
LegalKart frontend, its APIs, wallet, payment and auth flows were not available here, so this is
built from scratch, following these rules:

- **No production data is hardcoded.** All lawyers, prices, services, reviews and stats come through
  the typed `LegalKartApi` interface (`src/lib/api/types.ts`).
- With `NEXT_PUBLIC_API_BASE_URL` set, the HTTP client (`src/lib/api/http.ts`) is used.
- With it unset, a **preview data source** (`src/lib/api/preview.ts`) is used, and **every page
  shows a "Preview data" banner**. The preview source returns **no reviews, no platform stats
  and no articles**, so no made-up social proof can ever be published. It has no session, so
  Call/Chat stops at the sign-in step.
- Preview lawyer names and starting prices (Talk from ₹31/min, Chat from ₹22/min) mirror the
  current live site's screenshots and exist only to exercise the UI.

## 2. Architecture

| Area | Location |
| --- | --- |
| API models / interface | `src/lib/api/types.ts` |
| HTTP client (endpoint paths) | `src/lib/api/http.ts` |
| Preview data | `src/lib/api/preview.ts` |
| Custom-rate rule | `src/lib/pricing.ts` (`resolveRate`) |
| Consult URL state | `src/lib/consult-query.ts` |
| Funnel analytics | `src/lib/analytics.ts` (pushes to `window.dataLayer`) |
| Brand / routes / support / store URLs | `src/config/site.ts` |
| FAQ copy | `src/content/faq.ts` |
| Header (dropdowns, mobile drawer), footer | `src/components/layout/*` |
| Home sections | `src/components/home/*` |
| Lawyer card, rate, Call/Chat gate | `src/components/lawyer/*` |
| Consult explorer, filters, pagination | `src/components/consult/*` |

Routes: `/` (Home, ISR 5 min), `/consult` (SSR + client refinement), `/lawyers/[slug]` (ISR 60 s),
`/services/[slug]` (SSG + ISR), `/sitemap.xml`, `/robots.txt`.

## 3. API contract (assumed — confirm against the backend)

| Method | Path | Returns |
| --- | --- | --- |
| GET | `/catalog/services` | `Service[]` (name, summary, group, icon, `price` or `null`, href) |
| GET | `/catalog/nav` | `NavMenu[]` (Property / Document / Startup dropdowns) |
| GET | `/lawyers/featured?limit=` | `Lawyer[]` |
| GET | `/lawyers?q&specialty&language&mode&minExperience&minRating&maxRate&available=1&sort&page` | `LawyerPage` |
| GET | `/lawyers/:slug` | `Lawyer` (404 → not found) |
| GET | `/lawyers/search-capabilities` | `SearchCapabilities`: which filters the backend supports, plus the specialty and language lists |
| GET | `/reviews?limit=` | `Review[]` (display names per privacy policy) |
| GET | `/platform/stats` | `PlatformStat[]` (verified figures only) |
| GET | `/articles?limit=` | `Article[]` |
| GET | `/me` | `Session` (401 → signed out) |
| GET | `/consult/quote?lawyerId&mode` | `ConsultQuote` (effective rate, wallet balance, minimum balance, availability, pending payment) |
| POST | `/consult/sessions` `{lawyerId, mode}` | `started` + `sessionUrl` \| `insufficient_balance` \| `lawyer_unavailable` \| `payment_pending` |

Requests use `credentials: "include"`, so the API must allow CORS with credentials from the site
origin, or be served same-origin through a rewrite.

### Business rules implemented
- **Custom rates:** an active, unexpired custom rate replaces the default. The default is shown
  struck through **only** when the custom rate is lower. Customers never see a custom-rate
  editing action. Unit tested.
- **Filters are capability-driven:** a filter renders only if `/lawyers/search-capabilities`
  says the backend supports it.
- **Consultations start only on backend confirmation.** The gate runs session → quote →
  balance check → `POST /consult/sessions` and navigates only on `status: "started"`. Low
  balance sends the user to the existing wallet recharge (`NEXT_PUBLIC_WALLET_RECHARGE_URL`)
  with the shortfall and a return URL. Pending payments show a "don't pay again" state.
  Unavailable lawyers link to available alternatives in the same specialty.
- **The selection survives sign-in and recharge:** return URLs carry `start=<mode>&lawyer=<slug>`,
  which reopens the gate on the same lawyer.

## 4. Home page sections
Hero (search combobox over real specialties and services, popular searches, Find a Lawyer and
Explore Services CTAs, Call/Chat starting prices, "available now" lawyers) → service catalogue
(no duplicates; compact rows on mobile) → featured lawyers → how it works, with a comparison of
Call, Chat, AI review and Lawyer review → trust (stats only if the API returns them) → reviews
(rendered only from API data) → FAQ (native `<details>` + FAQPage JSON-LD) → resource links →
app promotion (store buttons only when URLs are configured) → footer.

## 5. Consult screen
Breadcrumbs → H1 → debounced search (350 ms, `replace` history) → Call/Chat/All toggle →
specialty chips → sidebar filters (drawer on mobile) → sort → result count → removable filter
chips + Clear all → results (skeleton, dimmed refetch, error retry, empty state) → link-based
pagination → FAQs and document-review alternatives.

- The URL is the single source of truth, so state is shareable and back/forward restores it.
- Superseded requests are aborted, and only the latest response is applied (unit tested).
- SEO: `/consult` and `/consult?specialty=x` are indexable landing pages. Other filter
  combinations are `noindex, follow` and canonicalise to their specialty page.

## 6. SEO & accessibility
Per-route titles, descriptions and canonicals; Organization, BreadcrumbList and FAQPage JSON-LD
(**no review or aggregate-rating markup**); sitemap with specialty, service and lawyer URLs;
robots; `next/font` with `display: swap`; skip link; visible focus rings; keyboard dropdowns
(Enter/Space, ArrowUp/Down, Escape restores focus); focus-trapped mobile drawer; native `<dialog>`
for the consult gate and filter drawer; touch targets ≥ 44 px; `prefers-reduced-motion` honoured;
safe-area insets on mobile sheets.

## 7. Conversion measurement
Events pushed to `dataLayer`: `search_submitted`, `search_suggestion_selected`,
`service_card_selected`, `lawyer_profile_viewed`, `consult_mode_selected`,
`consult_quote_shown`, `consult_recharge_started`, `consult_started`, `consult_blocked`
(reason), `filter_changed`, `app_store_clicked`.

To find the real drop-off at ~250 visits and ~11 purchases a day:
1. In GTM/GA4, build the funnel landing → `consult_mode_selected` → `consult_quote_shown` →
   `consult_recharge_started` → **backend-confirmed payment** (send from the server or
   payment webhook, never from a click). Segment by device, source, landing page and
   new vs returning.
2. At this volume, an A/B test needs several weeks per variant to detect anything but very
   large effects. Prioritise fixing the largest observed drop-off first, then test.
3. Likely hypotheses to check first: price visibility before sign-in, sign-in friction at the
   gate, and the minimum-balance step.

## 8. Validation (this commit)
- `npm run lint`: clean · `npm run typecheck`: clean · `npm run build`: passes
- `npm test`: 22 unit tests covering the custom-rate rule, URL state, preview search
  (filter, sort, pagination) and out-of-order search responses
- Browser checks (Playwright/Chromium): no horizontal overflow at 320, 390, 768, 1024, 1440
  and 1680 px on Home, Consult, Profile and Service; no console errors. 20 interaction checks
  passed: dropdown keyboard navigation and viewport containment, search suggestions, filters,
  back/forward restore, debounced search, empty state, clear-all, sign-in gate preserving
  lawyer + mode, resume-after-login, mobile drawer, touch targets, mobile filter drawer.

## 9. Open items / limitations
- **Backend not integrated.** Endpoint paths and payloads in §3 are assumptions; reconcile
  them in `src/lib/api/http.ts` only.
- **Product checkout:** `/services/[slug]` explains each service and hands off to a
  consultation. Product SKUs, prices and checkout live in the existing commerce flow and need
  linking.
- **Routes outside this app** (blogs, check-challans, account, login, wallet, policy pages)
  are linked by path and not prefetched (`isAppRoute` in `src/config/site.ts`). Confirm the
  paths, or set the env overrides.
- **Language switcher** (हिंदी, বাংলা…) from the current site isn't implemented. Its
  `site.languages` list is ready, but no i18n content exists.
- **Copy to confirm with legal/product:** footer disclaimer, trust-section wording
  (verification, privacy), app benefits, FAQ answers about app requirements and after-payment
  steps.
- **App store URLs** must be set (`NEXT_PUBLIC_PLAY_STORE_URL`, `NEXT_PUBLIC_APP_STORE_URL`).
  Until then, the buttons are hidden.
- **Lawyer photos:** set `NEXT_PUBLIC_IMAGE_HOST` so `next/image` can optimise CDN images.
  Initials are the fallback.
