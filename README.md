# Vienna Cuts — Barbershop Booking Demo

A bilingual (German-first, English secondary) barbershop website with a real booking engine, an AI voice receptionist, Stripe payments and a staff dashboard. Built with React 19, TypeScript and Vite.

**Live preview:** https://demo2-barber-jade.vercel.app

![Home page](shot-home-desktop.png)

> **This is a fictional demonstration site.** Vienna Cuts is not a real business. Names, barbers, prices, opening hours, testimonials, addresses and phone numbers are invented demo content. There is no real shop, no real bookings and no real customer data.

---

## Contents

- [What it does](#what-it-does)
- [Stack](#stack)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Supabase schema](#supabase-schema)
- [Payments and email](#payments-and-email)
- [AI voice receptionist](#ai-voice-receptionist)
- [Routes](#routes)
- [Project structure](#project-structure)
- [Serverless API](#serverless-api)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)

---

## What it does

**Customer side**

- **Bilingual UI** — German by default, English on toggle. Every string lives in `src/lib/i18n.tsx`; the choice persists in `localStorage` and updates `<html lang>`.
- **Booking flow** (`/buchen`) — four steps: service → barber → Vienna-local date/time → contact details. Availability is computed from opening hours, per-barber weekly schedules, service duration and existing bookings, with a 30-minute lead time. Bookings re-validate the slot at write time to prevent double-booking, and "any barber" assigns the first eligible free barber.
- **Payment choice** — pay online via Stripe Checkout, or pay in person at the shop.
- **Practical extras** — gallery with keyboard lightbox, fictional legal pages, sticky mobile-safe navigation, reduced-motion support.

**Staff side** (`/inhaber`)

- Today's counters (appointments, upcoming, open, confirmed, completed, canceled, demo revenue, utilization).
- Booking list with search, status filters and one-tap status transitions (pending → confirmed → completed / canceled).
- Day and week calendar views, 7-day utilization chart, CSV export.
- Per-booking actions: WhatsApp link, resend confirmation email, Stripe payment link.

**AI side**

- `/ai` — a browser voice call with "Haris", a Vapi-powered AI receptionist that can read services, check live availability and create a booking through a server-side tool endpoint.

---

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 19, TypeScript 5.9, Vite 7 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`), custom `ink`/`copper`/`ivory` palette |
| Routing | `react-router-dom` 7 — **HashRouter** (`/#/buchen`), so it works on any static host |
| Animation | `framer-motion`, `lucide-react` icons |
| Data | Supabase (`@supabase/supabase-js`) with a `localStorage` fallback |
| Payments | Stripe Checkout (server-side only, secret key never reaches the browser) |
| Email | Resend REST API |
| Voice AI | `@vapi-ai/web` (client) + serverless tool handler (server) |
| Hosting | Vercel Functions (`api/*.ts`) |

The app **runs with zero configuration**: if `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are absent, the store transparently falls back to `localStorage` with seeded demo appointments. That is the mode the live preview runs in when no backend is wired up.

---

## Quick start

Requires Node.js 20+ (verified on Node 22) and npm.

```bash
npm ci
npm run dev
```

Open the printed URL. No env file, account, API key or build step is needed to explore the site and the dashboard — everything works in local demo mode.

```bash
npm run build      # tsc -b && vite build  → dist/
npm run preview    # serve the production build
npm run lint       # eslint (known to report errors — see Known limitations)
```

**Dashboard login in demo mode:** open `/#/inhaber` and enter the password `vienna2026` (defined at `src/pages/Owner.tsx`). This is a client-side demo gate, **not** authentication — it only exists to keep the fake dashboard out of casual clicks. With Supabase configured, sign-in switches to real Supabase Auth (email + password) and the demo password is ignored.

---

## Configuration

Copy `.env.example` to `.env.local` and fill in only what you need. Vite exposes `VITE_*` variables to the browser; **everything else is server-only** and is used by the `api/` functions.

| Variable | Scope | Required for | Purpose |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | client | Supabase mode | Project URL; also read server-side |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | client | Supabase mode | Publishable key (`sb_publishable_…`), safe in the browser |
| `SUPABASE_SECRET_KEY` | **server** | Payments, email, AI | Secret key (`sb_secret_…`) that bypasses RLS for admin writes |
| `SUPABASE_URL` | **server** | optional | Fallback when `VITE_SUPABASE_URL` is not present at runtime |
| `STRIPE_SECRET_KEY` | **server** | Online payment | Stripe secret (`sk_test_…` / `sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | **server** | Online payment | Webhook signing secret (`whsec_…`) |
| `RESEND_API_KEY` | **server** | Email | Resend API key |
| `VITE_VAPI_PUBLIC_KEY` | client | Voice AI | Vapi public key |
| `VITE_VAPI_ASSISTANT_ID` | client | Voice AI | Vapi assistant ID |
| `VAPI_TOOL_SECRET` | **server** | Vector AI (optional) | Shared secret; when set, `/api/ai-tools` requires an `x-ai-secret` header |
| `SITE_URL` | **server** | Voice AI (optional) | Public site URL used in emails/links, defaults to the Vercel deployment |

Never commit `.env.local`. Only the two `VITE_SUPABASE_*` values are safe to expose — the rest must live in your hosting provider's environment settings.

---

## Supabase schema

The client reads and writes a single `bookings` table. This DDL is derived from the row mapping in `src/lib/store.ts` — create it in the Supabase SQL editor:

```sql
create table if not exists public.bookings (
  id               text primary key,
  service_id       text        not null,
  barber_id        text        not null,
  date_iso         date        not null,
  time             text        not null,          -- "HH:MM", Europe/Vienna
  name             text        not null,
  email            text        not null,
  phone            text,
  note             text,
  status           text        not null default 'pending'
                   check (status in ('pending','confirmed','completed','canceled')),
  created_at_ms    bigint,
  payment_method   text        check (payment_method in ('online','in_person')),
  stripe_session_id text
);

create index if not exists bookings_date_idx on public.bookings (date_iso, barber_id);
```

Then enable the owner account under **Authentication → Users** (email + password). That is what the dashboard login uses once Supabase is configured.

**Row Level Security matters here.** This table holds personal data (name, email, phone), and the browser talks to it with the publishable key. A sensible starting point:

- `anon`: `SELECT` restricted to the scheduling columns the availability engine needs, plus `INSERT` for new bookings and `UPDATE` of `payment_method` only.
- `authenticated` (the owner): full `SELECT`/`UPDATE`.
- The `api/` functions use `SUPABASE_SECRET_KEY`, which bypasses RLS — that is how they confirm bookings and send mail.

Column-level grants are the cleanest way to hide PII from `anon`; if that is awkward, expose a view containing only `id, service_id, barber_id, date_iso, time, status`. The client already limits its own anonymous query to those columns (`loadBusy()` in `store.ts`), but RLS is what actually enforces it.

---

## Payments and email

**Stripe.** Create a webhook pointing at `https://your-deployment/api/stripe-webhook`, subscribed to `checkout.session.completed`, and put its signing secret in `STRIPE_WEBHOOK_SECRET`. On payment, the webhook verifies the signature against the raw body, flips the booking to `confirmed` and sends the confirmation email. `/api/create-checkout` runs in `payment` mode in EUR and writes `stripe_session_id` back to the row. Without `STRIPE_SECRET_KEY` both endpoints return `503 payments_not_configured`, and the UI falls back to "pay in person".

**Resend.** Both `/api/resend-email` and the AI endpoint send from `onboarding@resend.dev`, Resend's shared sandbox sender. That address only delivers to your own verified account email — **verify a domain in Resend and replace the `from` address** before using this with real customers.

`/api/resend-email` requires `Authorization: Bearer <supabase access token>` and validates it against Supabase Auth, so only a signed-in owner can trigger a resend.

---

## AI voice receptionist

`/#/start` offers two booking paths (manual wizard or voice call), and `/#/ai` runs the call itself using the Vapi web SDK.

On the server, `/api/ai-tools` speaks the Vapi tool-call protocol:

```
POST /api/ai-tools
{ "message": { "toolCalls": [ { "id": "...", "function": { "name": "...", "arguments": "{...}" } } ] } }
→ { "results": [ { "toolCallId": "...", "result": "<json string>" } ] }
```

| Tool | What it does |
| --- | --- |
| `get_services` | Returns services, prices, durations and barbers |
| `check_availability` | Computes free slots for a date/service/barber, Vienna time |
| `create_booking` | Validates, inserts the booking, optionally creates a Stripe payment link and emails the customer |

Register `https://your-deployment/api/ai-tools` as a tool server on the Vapi assistant, and set `VAPI_TOOL_SECRET` there as the `x-ai-secret` header so the endpoint is not open to the public. Without the Vapi keys the voice page loads but cannot start a call.

---

## Routes

HashRouter, German paths:

| Route | Page |
| --- | --- |
| `/#/` | Home — hero, services, team, atmosphere, testimonials, FAQ |
| `/#/leistungen` | Services and prices |
| `/#/team` | Barbers |
| `/#/galerie` | Gallery with lightbox |
| `/#/studio` | About the studio |
| `/#/kontakt` | Contact and opening hours |
| `/#/buchen` | Manual four-step booking flow |
| `/#/start` | Booking chooser (manual vs. voice AI) |
| `/#/ai` | Voice call with the AI receptionist |
| `/#/inhaber` | Owner sign-in and dashboard |
| `/#/impressum`, `/#/datenschutz` | Fictional legal pages |

---

## Project structure

```
api/                  Vercel Functions (server-only, Node runtime)
  create-checkout.ts    Stripe Checkout session
  stripe-webhook.ts     Signature check → confirm booking → email
  resend-email.ts       Owner-triggered resend (Supabase Auth gated)
  ai-tools.ts           Vapi tool-call handler (services, availability, booking)
src/
  pages/                Home, Services, Team, Gallery, About, Contact,
                        Booking, ChooseBooking, AiBooking, Owner, Legal
  components/           Header, Footer, Logo, Shared (StatusPill, Kicker)
  lib/
    data.ts             Services, barbers, hours, Vienna-time helpers
    store.ts            Supabase + localStorage store, availability engine
    i18n.tsx            DE/EN dictionary
    app-context.tsx     Language context + toast system
    supabase.ts         Client (null when unconfigured → demo mode)
public/images/          Local demo photography
*.patch                 Historical milestone patches (see below)
```

`data.ts` holds the demo catalogue: five services, four barbers with individual weekly schedules, and opening hours. `viennaNow()` derives the current Vienna date/time, so the app behaves correctly regardless of the visitor's timezone.

---

## Serverless API

All four endpoints are Vercel Functions with a default export `handler(req, res)` and no framework dependencies.

| Endpoint | Method | Auth | Notes |
| --- | --- | --- | --- |
| `/api/create-checkout` | POST | none (public booking) | Returns `{ url }` to redirect to |
| `/api/stripe-webhook` | POST | Stripe signature | Raw body is read manually; do not add a body parser |
| `/api/resend-email` | POST | Supabase bearer token | Owner-only |
| `/api/ai-tools` | POST | optional `x-ai-secret` | Vapi tool protocol |

Local `vite dev` does **not** run `api/`. To exercise the endpoints locally, use `vercel dev`, or deploy a preview.

---

## Deployment

Vercel is the intended target because `api/` uses Vercel's function convention:

1. Import the repo, framework preset **Vite**, build command `npm run build`, output `dist`.
2. Add the environment variables from the table above (server ones without the `VITE_` prefix requirement).
3. Set the Stripe webhook and the Vapi tool server to the deployed URLs.
4. Redeploy after changing env vars — Vite inlines `VITE_*` at build time.

Because routing is hash-based, no rewrite rules are needed.

---

## Known limitations

- **No automated tests.** There is no test runner and no CI workflow, so nothing guards regressions.
- **`npm run lint` currently fails** with 42 errors: 25 `no-explicit-any` (mostly in `api/`, where Vercel handlers are typed `any`), 6 unused variables, 3 empty blocks and 1 `@ts-ignore`. `npm run build` succeeds because `tsc -b` does not apply ESLint rules. Either loosen the rules for `api/**` and fix the unused variables, or accept lint as advisory.
- **`/#/start` is orphaned.** The header CTA goes straight to `/#/buchen` (manual booking), and nothing links to `/#/start`, so the voice-AI entry point is only reachable by typing the URL. Previously the CTA opened the chooser.
- **Demo-mode gate is not security.** `vienna2026` is compared in the browser; anyone can read the bundle. Real protection only exists in Supabase mode.
- **Bundle size.** The main chunk is ~585 kB (172 kB gzip) and the AI page pulls a further ~350 kB, loaded lazily. Manual chunking would trim the initial payload.
- **Historical `.patch` files** (`m3`–`m12`) sit in the repo root as a build log of earlier milestones and are now redundant with the source. They can be archived.
- **Arena preview tooling** ships in `index.html` (session recording, source-location tags emitted by `.vite-source-tags.js`). Both are inert outside Arena's preview environment but are worth stripping for a production deployment.
- **No license file.** Add one if you want others to reuse this code.

---

<div align="center">
<sub>Fictional demonstration project — no real business, customers or bookings.</sub>
</div>
