# Alhumaidhi Architects — Presentation Template

A premium, fullscreen **architecture-presentation platform** built as a reusable template.
One studio brand, many projects: each project is a complete, cinematic client deck with the
same structure, motion and rhythm — so a new presentation is made by **duplicating an existing
one and swapping the copy and imagery**, not by writing code.

Warm-ivory, editorial aesthetic in the spirit of high-end European architecture studios —
charcoal typography, muted taupe accents (Cormorant Garamond display / Inter sans), a soft
film-grain overlay, an animated preloader, a custom cursor, a fullscreen index menu, and
scroll-driven parallax / clip-path reveals throughout.

- **Next.js 16** (App Router) · **TypeScript**
- **Tailwind CSS v4**
- **Motion** (`motion/react`, ex-Framer Motion) for animation
- **Lenis** for smooth scrolling
- **Supabase** for editable content + image storage
- Fully responsive, `prefers-reduced-motion` aware

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint
```

The site runs with **no configuration** — it falls back to a built-in demo project
("Majlis House") defined in `src/lib/content.ts`. Add Supabase + an admin password (below)
to make the `/admin` editor save changes.

## How it works — projects & routes

The whole platform is a single content model (`SiteContent`):

```
SiteContent
  ├─ studio        global brand (wordmark, contact, socials)
  ├─ theme         global colour palette (shared by all projects)
  ├─ projects[]    each a complete, duplicatable presentation
  └─ publishedId   which project the root URL (/) shows
```

Each **project** carries its own `info` (name, client, location, year…), an editable
`sequence` (section order + visibility + menu labels), and its `sections` content.

| Route | Shows |
|-------|-------|
| `/` | The **published** project (set as "homepage" in the admin). |
| `/p/[slug]` | Any project by its slug — the **per-client share link**. |
| `/admin` | The password-protected editor. |
| `/admin/login` | Sign-in. |

## Section structure

Every project follows the same fixed nine-step sequence. Each is a fullscreen-friendly
client component in `src/components/sections/`, rendered in the project's chosen order by
`SectionRenderer.tsx`.

| # | Section | File | Notes |
|---|---------|------|-------|
| 01 | Cover           | `Cover.tsx`          | Fullscreen hero — full-bleed image/video, stacked title lines, animated meta. |
| 02 | Intro           | `Intro.tsx`          | Project named large, lead statement, full-bleed image, "at a glance" facts, secondary image. |
| 03 | Site Plot       | `SitePlot.tsx`       | Site photograph, design-intent text, and plan drawings. |
| 04 | GIF Diagram     | `GifDiagram.tsx`     | Full-bleed animated massing diagram (GIF or MP4) with caption. |
| 05 | Mood Images     | `MoodImages.tsx`     | Editorial collage of reference plates with per-image parallax. |
| 06 | Floors          | `Floors.tsx`         | **One slide per floor** — floor plan, design-intent text, and reference imagery. |
| 07 | Specifications  | `Specifications.tsx` | Grouped schedules as quiet ruled definition lists. |
| 08 | Cost Estimate   | `CostEstimate.tsx`   | Fully editable table (columns + rows), total and footnote. |
| 09 | Next Steps      | `NextSteps.tsx`      | Numbered steps, contact CTA, footer + back-to-top. |

The **Floors** section is special: it expands into one navigable slide per floor, each with
its own entry in the index and side ticks (see `src/lib/stops.ts`).

## The `/admin` editor

A browser-based, password-protected editor at **`/admin`** lets non-technical people manage
everything without touching code:

- **Projects** — create, **duplicate** (the fastest way to start a new deck), delete, rename,
  set the slug (share link), publish/unpublish, and choose which one is the homepage.
- **Sequence** — reorder sections, rename their menu labels, and show/hide them per project.
- **Every field** — eyebrows, titles, summaries, body copy, facts; project name, client,
  location, year, status, etc.
- **Images & video** — paste a URL **or** upload a file to Supabase Storage. Works for the
  cover, intro images, site photo & plans, the GIF diagram, mood images, and each floor's
  plan and reference images.
- **Cost table** — add/rename/remove columns, add/reorder/remove rows, set the total.
- **Studio & brand** — wordmark, contact, social links (shared across all projects).
- **Colours** — the shared palette (page background, text, accents…).

Content is stored as a single JSON document in **Supabase**; the public site reads it on every
request and falls back to the built-in `src/lib/content.ts` whenever Supabase isn't reachable.
`Save` revalidates the site instantly. Saved data is reconciled on read (`get-content.ts`),
including a migration path from the older single-deck shape.

### Setup (one time)

1. Copy `.env.local.example` → `.env.local` and fill in:

   ```bash
   ADMIN_PASSWORD=choose-a-strong-password
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key          # Settings → API
   # ADMIN_SESSION_SECRET=optional-extra-random-string
   ```

2. In the Supabase **SQL editor**, run:

   ```sql
   create table if not exists site_content (
     id int primary key default 1,
     data jsonb not null default '{}'::jsonb,
     updated_at timestamptz not null default now()
   );
   ```

3. *(Optional, for in-browser image uploads)* In Supabase **Storage**, create a **public**
   bucket named `site-media`. Without it you can still paste image URLs.

4. Restart `npm run dev`, open `/admin`, sign in with `ADMIN_PASSWORD`.

In production (Vercel) set the same variables under **Settings → Environment Variables**, then
redeploy. If any of these are missing, `/admin` shows a short setup notice and the public site
keeps serving its built-in content — nothing breaks.

> Auth is a single shared password kept in an httpOnly cookie — fine for a small studio deck.
> Set `ADMIN_PASSWORD` to something strong and serve over HTTPS in production. The
> `SUPABASE_SERVICE_ROLE_KEY` is a full-access secret — keep it server-side only (never commit
> it, never expose it to the browser).

## Adding a new editable field (in code)

The model is split into two places that must stay in sync:

1. **`src/lib/content.ts`** — the TypeScript shape + the built-in demo defaults.
2. **`src/lib/admin-schema.ts`** — the declarative description that *generates* the admin form.

Add the field to the relevant type/section in `content.ts`, then add a matching entry in the
section's schema in `admin-schema.ts`, and render it in the section component. To add a whole
new **section type**, also register it in `SECTION_ORDER`/`SECTION_LABELS` (`content.ts`),
`SectionRenderer.tsx`, `sectionSchemas` (`admin-schema.ts`), and — if it should be its own
nav stop — `stops.ts`.

Imagery in the demo defaults is referenced by Unsplash photo ID via the `img()` helper;
`next.config.ts` allows images from any HTTPS host so editors can point at any CDN / Supabase
Storage.

## Architecture

```
src/
  app/
    layout.tsx           Fonts, metadata, applies the editable colour palette to <html>
    page.tsx             Renders the published project via <Presentation>
    p/[slug]/page.tsx    Per-client project page (share link) + per-project metadata
    globals.css          Tailwind v4 theme, type helpers, grain/vignette, Lenis CSS
    admin/               The /admin editor (layout, dashboard page, /admin/login)
    api/admin/           Route handlers: login, logout, save (content), upload (image)
  components/
    Presentation.tsx     One project's deck: provider + AppShell + SectionRenderer
    SectionRenderer.tsx  Renders a project's sections in its sequence order
    AppShell.tsx         Lenis provider + Preloader + Cursor + Navigation + ScrollProgress
    Preloader.tsx        Animated loading screen (progress counter → curtain lift)
    Cursor.tsx           Spring-following custom cursor (pointer:fine only)
    Navigation.tsx       Fixed header + fullscreen clip-reveal index menu
    ScrollProgress.tsx   Top progress bar, bottom-left section label, right-side index
    sections/*.tsx       The nine presentation sections (read content from context)
    admin/               AdminDashboard, schema-driven form fields, login form, notices
    ui/
      Section.tsx        Section shell (id + data-section index) and SectionTag label
      Media.tsx          next/image|video with clip-path reveal + optional scroll parallax
      AnimatedText.tsx   Word- or line-staggered text reveal (semantic tag passthrough)
      Reveal.tsx         Fade-up-on-view wrapper
  lib/
    content.ts           Types, the default demo project, and shared helpers (slugify, …)
    content-context.tsx  Client context + hooks (useStudio / useInfo / useSections / useStops)
    get-content.ts       Loads live content from Supabase, reconciles over the defaults
    stops.ts             Builds the navigable "stops" (Floors expands one stop per floor)
    supabase-admin.ts    Server-only Supabase client (service-role key)
    admin-auth.ts        Password check + signed session cookie helpers
    admin-schema.ts      Declarative description of every editable field (drives the forms)
    theme-style.ts       Turns the palette into the CSS variables Tailwind tokens use
    motion.ts            Shared easings, variants and viewport presets
    intro.tsx            IntroContext — lets sections react to the preloader finishing
```

Reduced-motion: the grain animation and all transitions are neutralised under
`@media (prefers-reduced-motion: reduce)`.
