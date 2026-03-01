# Kat's Kronicles (Eleventy)

Static site for game reviews and boss features, migrated from Astro to Eleventy.

## Stack

- Eleventy (`@11ty/eleventy`)
- Nunjucks layouts/partials
- Markdown/MDX-like content parsing via `gray-matter` + `markdown-it` (raw HTML supported)
- Image optimization via `@11ty/eleventy-img` for template-rendered images (fallbacks render plain `<img>` if package is unavailable)

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

Build output is written to `dist/`.

## Comments API Scaffold

This repo now includes a minimal Netlify-style comments API scaffold:

- `GET /api/comments?thread=reviews/xenoblade-chronicles-3`
- `POST /api/comments`

Files:

- `netlify/functions/comments.js` request handler
- `src/server/comments-api.js` validation + comment shaping
- `src/server/supabase.js` server-side Supabase REST wrapper

Required env vars:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The scaffold currently matches the comments table shape discussed in setup:

- `id`
- `parent_id`
- `thread`
- `name`
- `body`
- `created_at`

If you rename `thread` to `thread_id` later, update `THREAD_COLUMN` in `src/server/comments-api.js`.

## Project Structure

- `src/content/reviews/` review content (`.md` / `.mdx`)
- `src/content/bossfeatures/` boss feature content (`.md` / `.mdx`)
- `src/site/` Eleventy pages, layouts, partials, global data
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
