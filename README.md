# Alhumaidhi Architects — Cinematic Presentation

A premium, fullscreen architecture-presentation website for **Alhumaidhi Architects** —
a warm-ivory, editorial aesthetic in the spirit of high-end European architecture studios
(à la the "Balzar" template), with cinematic transitions and fullscreen storytelling kept
intact. Built as a **reusable presentation template**: swap the content model and you have a
brand-new project deck with the same motion, rhythm and layout.

- **Next.js 16** (App Router) · **TypeScript**
- **Tailwind CSS v4**
- **Motion** (`motion/react`, ex-Framer Motion) for animation
- **Lenis** for smooth scrolling
- Warm-ivory editorial aesthetic in the spirit of premium European architecture
  studios (Balzar-style) · charcoal typography, muted taupe accents · minimal
  architecture typography (Cormorant Garamond display / Inter sans) · soft film-grain overlay
- Animated **preloader** with progress counter and curtain transition
- **Custom cursor**, fullscreen **elegant menu**, scroll progress + section index
- Scroll-driven **parallax**, clip-path image reveals, word/line text reveals
- Fully responsive, `prefers-reduced-motion` aware

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint
```

## Section structure

The deck is a single page (`src/app/page.tsx`) composed of nine cinematic sections,
each a fullscreen-friendly client component in `src/components/sections/`:

| # | Section            | File           | Notes |
|---|--------------------|----------------|-------|
| 01 | Cover             | `Cover.tsx`     | Fullscreen hero — Ken-Burns zoom, layered parallax, animated meta. |
| 02 | Project Overview  | `Overview.tsx`  | Project name, lead statement, full-bleed image, “at a glance” facts. |
| 03 | Concept           | `Concept.tsx`   | Design intent, keyword, sticky image, operating principles. |
| 04 | Moodboard         | `Moodboard.tsx` | Masonry collage of reference plates with per-image parallax. |
| 05 | Plans             | `Plans.tsx`     | Horizontal snap-scroll gallery of plan drawings, level by level. |
| 06 | Renders           | `Renders.tsx`   | Full-bleed cinematic visualisations with overlaid captions. |
| 07 | Materials         | `Materials.tsx` | Alternating material palette — swatch + description. |
| 08 | Team              | `Team.tsx`      | Studio statement, core team, consultant team. |
| 09 | Contact           | `Contact.tsx`   | Oversized CTA, email/phone/address, socials, footer + back-to-top. |

## The `/admin` editor

There is a browser-based, password-protected editor at **`/admin`** so non-technical
people can change the deck without touching code. It can edit:

- every piece of text — eyebrows, titles, subtitles, descriptions, body copy
- all images (paste a URL **or** upload a file to Supabase Storage)
- the colour palette (page background, alternate section background, text, accent…)
- which sections are visible, and their names in the navigation menu
- studio/brand details, contact info, social links, and the project facts

Content is stored as a single JSON document in **Supabase**; the public site reads it
on every request (falling back to the built-in `src/lib/content.ts` whenever Supabase
isn't reachable), and `Save` revalidates the site instantly.

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

3. *(Optional, for in-browser image uploads)* In Supabase **Storage**, create a
   **public** bucket named `site-media`. Without it you can still paste image URLs.

4. Restart `npm run dev`, open `/admin`, sign in with `ADMIN_PASSWORD`.

If any of these are missing, `/admin` shows a short setup notice and the public site
keeps serving its built-in content — nothing breaks.

> Auth is a single shared password kept in an httpOnly cookie — fine for a small studio
> deck. Set `ADMIN_PASSWORD` to something strong and serve over HTTPS in production.

## How to re-skin it for a new project (in code)

The built-in defaults live in **`src/lib/content.ts`** — the fallback the site uses
before anything is saved through `/admin`:

- `studio` — brand wordmark, contact details, socials.
- `nav` — the ordered section list (drives the menu, the side index and section IDs).
- `presentation` — per-section copy and imagery (`cover`, `overview`, `concept`,
  `moodboard`, `plans`, `renders`, `materials`, `team`, `contact`).
- `theme` — the editable colour palette; `visibility` — which sections render.

Imagery is referenced by Unsplash photo ID via the `img()` helper; `next.config.ts`
allows images from any HTTPS host so the editor can point at any CDN/Supabase Storage.
The editor's form layout is generated from `src/lib/admin-schema.ts` — add a field
there to make it editable.

## Architecture

```
src/
  app/
    layout.tsx          Fonts, metadata, applies the editable colour palette to <html>
    page.tsx            ContentProvider + AppShell + <SectionList>
    globals.css         Tailwind v4 theme, type helpers, grain/vignette, Lenis CSS
    admin/              The /admin editor (layout, dashboard page, /admin/login)
    api/admin/          Route handlers: login, logout, save (content), upload (image)
  components/
    AppShell.tsx        Lenis provider + Preloader + Cursor + Navigation + ScrollProgress
    SectionList.tsx     Renders the visible sections in order (reads `visibility`)
    Preloader.tsx       Animated loading screen (progress counter → curtain lift)
    Cursor.tsx          Spring-following custom cursor (pointer:fine only)
    Navigation.tsx      Fixed header + fullscreen clip-reveal menu (Lenis-powered scroll)
    ScrollProgress.tsx  Top progress bar, bottom-left section label, right-side index
    sections/*.tsx      The nine presentation sections (read content from context)
    admin/              AdminDashboard, schema-driven form fields, login form, notices
    ui/
      Section.tsx       Section shell (id + data-section index) and SectionTag label
      Media.tsx         next/image with clip-path reveal + optional scroll parallax + tint
      AnimatedText.tsx  Word- or line-staggered text reveal (semantic tag passthrough)
      Reveal.tsx        Fade-up-on-view wrapper + RevealGroup for staggered children
  lib/
    content.ts          Built-in defaults + SiteContent / theme / visibility types
    content-context.tsx Client context + hooks (useStudio / useNav / usePresentation …)
    get-content.ts      Loads live content from Supabase, deep-merged over the defaults
    supabase-admin.ts   Server-only Supabase client (service-role key)
    admin-auth.ts        Password check + signed session cookie helpers
    admin-schema.ts      Declarative description of every editable field (drives the forms)
    theme-style.ts       Turns the palette into the CSS variables Tailwind tokens use
    motion.ts           Shared easings, variants and viewport presets
    intro.tsx           IntroContext — lets sections react to the preloader finishing
```

Reduced-motion: the grain animation and all transitions/animations are neutralised under
`@media (prefers-reduced-motion: reduce)`.
