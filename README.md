# Cardly — Digital Card & Invitation Maker

**Create Beautiful Cards. Share Moments That Matter.**

Cardly is a production-ready web app for designing professional **business cards**, **wedding & event
invitations**, **greeting cards** (Eid, Ramadan, birthdays, thank-you notes…) and **custom cards** in a
live drag-and-drop editor — then sharing them via high-resolution **PNG / JPG / PDF downloads**, a public
**shareable link**, or an auto-generated **QR code**.

---

## ✨ Features

### Landing page
- Animated hero with **live-rendered template previews** and auto-cycling showcase
- 8 card categories, 3-step "How it works", template showcase, features, testimonials, pricing & CTA
- Light/dark mode, fully responsive, micro-interactions everywhere

### Template library (`#/templates`)
- 20 hand-crafted templates across 11 categories (business, wedding, birthday, Eid, Ramadan,
  engagement, graduation, anniversary, corporate, thank-you, greetings)
- Search + filter by category, style and orientation; save favorites (heart)
- Full-screen template preview with front/back switching

### Interactive card editor (`#/editor/:id`) — the core
- **Three-panel layout**: icon rail + contextual panels · zoomable canvas · dynamic inspector
- Left panels: **Templates · Text · Images · Backgrounds · Shapes · Icons · Stickers · QR code ·
  Details (smart fields) · Layers**
- Canvas: drag, 8-handle resize, rotate, **center/edge snapping guides**, inline text editing
  (double-click), zoom & fit-to-screen, front/back switching for two-sided cards
- Text: font family/size/weight/color/alignment, bold-italic-underline, letter spacing, line height
- Images: upload (auto-resized & embedded), fit/fill, corner radius, circular crop, borders
- Backgrounds: solid, gradients (12 presets + custom), 6 pattern styles, image background with dim overlay
- Layers: reorder, bring/send to front-back, duplicate, delete, lock & hide
- Full **undo/redo** history (⌘Z / ⌘⇧Z) + keyboard shortcuts (arrows nudge, ⌫ delete, ⌘D duplicate, ⌘S save)
- **Smart fields**: structured business/invitation details (venue, date, RSVP, dress code…) that
  instantly update every bound text element on the card

### Sharing & export
- **Download**: PNG & JPG (2× resolution, e.g. 2100×1200 for business cards) and print-ready **PDF**
- **Public link**: publish any card to `#/card/:slug` — full-screen viewer with download button,
  Web Share API support, and a "Create your own" CTA; unpublish any time
- **QR code**: auto-generated from the public link, downloadable as PNG
- **vCard (.vcf)** download for business cards + contact QR code encoding

### Accounts & dashboard
- Email/password sign-up & sign-in, password reset flow, profile editing, session cookie auth
  (HMAC-signed, http-only)
- **Instant demo account** (`demo@cardly.app` / `demo1234`) preloaded with sample cards
- Dashboard: stats, search, category/status filters, card thumbnails, edit / duplicate / preview /
  publish / delete actions, saved-templates shelf

---

## 🧱 Tech stack

| Layer      | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router) + TypeScript 5                        |
| Styling    | Tailwind CSS 4 + shadcn/ui (New York) + custom violet theme   |
| Animation  | Framer Motion                                                 |
| State      | Zustand (app router + editor store with history)              |
| Forms      | React Hook Form + Zod                                         |
| Database   | MongoDB (`mongodb` driver, Prisma-style data layer in `src/lib/db.ts`) |
| Icons      | Lucide React                                                  |
| Fonts      | Self-hosted via Fontsource (Inter, Space Grotesk, Playfair Display, Cormorant Garamond, Great Vibes, Dancing Script, Bebas Neue, Caveat) |
| Export     | html-to-image (PNG/JPG), jsPDF (PDF), qrcode (QR)             |
| Auth       | Custom HMAC session cookie + scrypt password hashing          |

> The design of every card is persisted as **structured JSON** (`CardDesign` in `src/lib/design/types.ts`)
> so any card can be reopened and edited later — the same JSON drives the canvas, thumbnails, the
> public viewer and the exports.

## 🗂 Project structure

```
src/
├── app/
│   ├── page.tsx              # SPA shell + hash router (#/templates, #/editor/:id, #/card/:slug …)
│   ├── layout.tsx            # fonts, metadata, providers, toaster
│   └── api/                  # auth (signup/login/demo/me/reset/profile/password),
│                             # cards CRUD + duplicate, public card by slug
├── lib/
│   ├── design/               # types (CardDesign JSON model), renderer, templates (20),
│   │                         # element factory, export (PNG/JPG/PDF/vCard/QR), assets
│   ├── stores/               # app-store (router/auth/favorites), editor-store (history)
│   ├── api-client.ts         # typed fetch wrappers
│   ├── auth-server.ts        # scrypt hashing, session cookies, reset tokens
│   └── seed.ts               # demo user + sample cards
└── components/
    ├── layout/               # navbar, footer, theme toggle, auth dialog
    ├── landing/              # hero, categories, how-it-works, showcase, features, testimonials
    ├── templates/            # gallery + template detail
    ├── create/               # card-type chooser
    ├── editor/               # canvas (drag/resize/rotate), left panels, right inspector, share dialog
    ├── dashboard/            # card management
    └── views/                # auth, profile, pricing, public card viewer
```

## 🚀 Getting started

```bash
npm install

cp .env.example .env     # dummy env — every variable is explained inline
npm run dev              # auto-starts local MongoDB + the dev server on http://localhost:3000
```

MongoDB runs locally out of the box (`scripts/mongo-start.sh` boots a local mongod,
data lives in `db/mongo-data/`). To use **MongoDB Atlas** instead, set `MONGODB_URI`
in `.env` to your cluster URI — no local mongod is started when the URI is remote.

The demo account is created automatically on first sign-in/demo click. Everything runs with the
default `.env.example` values — you only **need** to change variables when you go to production.

## ⚙️ Environment variables

All backend configuration is centralized in `src/lib/env.ts` and driven by these variables
(a documented dummy template lives in **`.env.example`** — copy it, change values, done):

| Variable | Default | What it does |
| --- | --- | --- |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017` | MongoDB connection string — local mongod (auto-started) or a `mongodb+srv://…` Atlas cluster |
| `MONGODB_DB` | `cardly` | Database name when the URI has no `/dbname` suffix |
| `AUTH_SECRET` | dev fallback | 🔴 Session-cookie signing secret. **Required in production** (app refuses to boot without it). Generate: `openssl rand -hex 32` |
| `SESSION_TTL_DAYS` | `30` | Login session lifetime |
| `APP_URL` | request origin | 🔴 Canonical public origin (no trailing slash) used for share links, QR codes & reset e-mails |
| `NEXT_PUBLIC_APP_URL` | — | Same value, readable by the browser (keeps QR codes on your real domain) |
| `APP_NAME` | `Cardly` | App name used in e-mails |
| `DEMO_MODE` | `true` | `false` hides the instant-demo button and disables `/api/auth/demo` |
| `DEMO_EMAIL` / `DEMO_PASSWORD` | `demo@cardly.app` / `demo1234` | Demo account credentials |
| `RESEND_API_KEY` | — | Optional. When set, password-reset links are e-mailed for real (Resend, plain fetch) |
| `EMAIL_FROM` | `Cardly <onboarding@resend.dev>` | Sender identity for reset e-mails |
| `RATE_LIMIT_MAX` | `20` | Auth attempts per IP per window (login/signup/reset) |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate-limit window |

**Switching to MongoDB Atlas:** create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com),
allow your IP in Network Access, create a database user, then set:

```bash
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Restart the app — collections and indexes (`users`, `cards`) are created automatically on first use.

**Handy scripts:** `npm run db:start` (start/ensure the local mongod) and
`npm run db:reset` (stop it and wipe local data).

**Health & config endpoints:** `GET /api/health` (db up/down + active config) and
`GET /api/config` (public client settings).

## ☁️ Deployment (Vercel)

1. Push the repository to GitHub and import it in Vercel.
2. Set the 🔴 variables from the table above (`MONGODB_URI`, `AUTH_SECRET`, `APP_URL`,
   `NEXT_PUBLIC_APP_URL`, and turn `DEMO_MODE` off unless you want the demo button). Use a
   MongoDB Atlas URI (or any managed Mongo) — the app connects at runtime, nothing to do at build time.
3. `npm run build` produces a standalone output; Vercel's Next.js preset works out of the box.
4. All API routes are serverless-friendly; images are embedded in card JSON, so no storage bucket is
   required. For heavier storage needs, move image uploads to Supabase Storage / S3 and store the URL
   in the `ImageElement.src` field.

## 🔐 Security notes

- Passwords are hashed with scrypt + per-user salt; sessions are HMAC-SHA256 signed, http-only cookies.
- Card APIs are scoped to the owning user; public card data is exposed only through its published slug.
- Password reset issues single-use, 30-minute tokens. Without a mail provider (`RESEND_API_KEY` unset)
  the token is surfaced in the UI; with one configured, a styled reset e-mail is sent instead.
- Auth endpoints (login / signup / reset / reset-confirm) are rate-limited per IP.

## 🧪 Verified flows

- Template → editor → edit text/images/backgrounds → undo/redo → save to dashboard
- Drag, resize, rotate, snap guides, inline text editing, layer reordering
- Publish → public link → QR code → public viewer with PNG download
- Business card front/back + vCard download, invitation smart fields sync
- Sign up / sign in / demo login / password reset / profile & password change
