# Kat's Kronicles (Astro)

Static site for game reviews and boss features, now running as a fully static Astro build.

## Stack

- Astro
- Astro content collections
- Astro layouts/pages with React islands where interactive UI is needed
- MDX content via `@astrojs/mdx`

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

Build output is written to `dist/`.

Comments are now frontend-only placeholders. The previous API, Netlify function, and Supabase integration were removed so local dev and deploys stay static.

## Project Structure

- `src/content/reviews/` review content (`.md` / `.mdx`)
- `src/content/bossfeatures/` boss feature content (`.md` / `.mdx`)
- `src/pages/` Astro routes
- `src/layouts/` Astro layouts
- `src/components/` UI components, including React islands
- `src/data/` local data modules used by Astro pages
- `src/styles/` shared/page/layout CSS (passthrough copied to `/styles`)
- `src/assets/` local images (passthrough copied to `/assets`, template images also optimized to `/img`)
- `public/` static assets (fonts, JS, favicons)

## Content Front Matter

Content is validated with `zod` in `src/site/_data/content-schemas.js`.

Highlights:

- `draft` (default `false`)
- `comments` (default `false`)
- `pubDate` / `updatedDate`
- review-only fields like `theme`, `gotyYear`, `platforms`, `genres`
- boss-feature-only fields like `game`, `bossType`, `verdictTone`, `tags`

## Visibility Rules

- Files with slugs starting with `_` are hidden.
- Draft and future-dated content is shown in dev/watch mode.
- Draft and future-dated content is hidden in production builds.
- Homepage curated GOTY/boss-feature logic intentionally uses broader visibility rules (matching prior Astro behavior).

## Images

- Template-rendered images (home page, archive cards, review hero, boss-feature hero, about hero) use Eleventy image generation.
- Inline `<img>` tags inside MD/MDX bodies remain passthrough and should point at `/assets/...` (current content already does this via relative paths).

## Feeds / SEO

- `/rss.xml` includes review entries only
- `/sitemap.xml` includes static routes + generated review/boss-feature routes
- Head metadata includes canonical/OG/Twitter tags and optional `COMMIT_REF` / `CONTEXT` build metadata when present

## Notes

- The old Astro source/config files were moved to `_archive/astro-root-source/` as a rollback/reference snapshot.
- Duplicate archive material is under `_archive/` (with one nested `.git` folder in `GameReviews/` potentially remaining if Windows permissions block moving it).
