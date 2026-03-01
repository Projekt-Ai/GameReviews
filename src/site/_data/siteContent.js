import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import { bossfeaturesSchema, reviewsSchema } from "./content-schemas.js";
import { toPosix } from "../_lib/html.js";
import { publicAssetFromFsPath } from "../_lib/images.js";

const md = new MarkdownIt({ html: true, linkify: true });

function stripMdxComments(input) {
  // Remove JSX-style block comments before Markdown rendering.
  // Nullish content becomes an empty string before comment stripping.
  return String(input ?? "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
}

async function walkFiles(dir) {
  // Recursively collect files from a content directory.
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      // Recurse into nested folders; otherwise return the file path.
      if (entry.isDirectory()) return walkFiles(full);
      return [full];
    }),
  );
  return files.flat();
}

function visibilityOptions(isDevLike, overrides = {}) {
  // Centralized visibility rules for drafts/future content.
  return {
    // Caller overrides win; otherwise inherit development-friendly defaults.
    includeDrafts: overrides.includeDrafts ?? Boolean(isDevLike),
    includeFuture: overrides.includeFuture ?? Boolean(isDevLike),
    now: overrides.now ?? new Date(),
  };
}

function isTemplateContentEntry(entry) {
  // Hide starter/template content files that begin with `_`.
  return entry.id.startsWith("_");
}

function isDraftContentEntry(entry) {
  return Boolean(entry.data.draft);
}

function isFutureDatedContentEntry(entry, now = new Date()) {
  const pubDate = entry.data.pubDate;
  return pubDate instanceof Date && pubDate.valueOf() > now.valueOf();
}

function isVisibleContentEntry(entry, options = {}) {
  // Apply template/draft/future filtering in one place.
  const { includeDrafts = false, includeFuture = false, now = new Date() } = options;
  // Exclude hidden/template entries and respect draft/future visibility flags.
  if (isTemplateContentEntry(entry)) return false;
  if (!includeDrafts && isDraftContentEntry(entry)) return false;
  if (!includeFuture && isFutureDatedContentEntry(entry, now)) return false;
  return true;
}

function sortByPubDateDesc(entries) {
  // Most page surfaces use newest-first ordering.
  // Missing/invalid dates sort as `0` to avoid crashes.
  return [...entries].sort((a, b) => (b.data.pubDate?.valueOf() ?? 0) - (a.data.pubDate?.valueOf() ?? 0));
}

function sortByPubDateAsc(entries) {
  // Some curated views (e.g., timelines) prefer oldest-first ordering.
  // Same safe-date behavior for ascending sorts.
  return [...entries].sort((a, b) => (a.data.pubDate?.valueOf() ?? 0) - (b.data.pubDate?.valueOf() ?? 0));
}

function normalizeHeroImage(filePath, heroImageRaw) {
  // Resolve front matter image paths to both FS and public URL forms.
  // Some entries intentionally omit hero images.
  if (!heroImageRaw || typeof heroImageRaw !== "string") return { heroImagePath: undefined, heroImageUrl: undefined };
  const abs = path.resolve(path.dirname(filePath), heroImageRaw);
  return {
    heroImagePath: abs,
    heroImageUrl: publicAssetFromFsPath(abs),
  };
}

function normalizeId(baseDir, filePath) {
  // Convert file path to a stable collection id used in URLs and thread IDs.
  const rel = toPosix(path.relative(baseDir, filePath));
  return rel.replace(/\.(md|mdx)$/i, "");
}

async function loadCollection(collection, baseDir, schema) {
  // Read markdown/MDX files, validate front matter, render HTML, and normalize metadata.
  // Load markdown and MDX source files from the collection directory tree.
  const files = (await walkFiles(baseDir)).filter((f) => /\.(md|mdx)$/i.test(f));
  const parsed = await Promise.all(
    files.map(async (filePath) => {
      // Parse front matter + render markdown body into HTML used by Nunjucks page templates.
      const source = await fs.readFile(filePath, "utf8");
      const fm = matter(source);
      const data = schema.parse(fm.data);
      const id = normalizeId(baseDir, filePath);
      const { heroImagePath, heroImageUrl } = normalizeHeroImage(filePath, data.heroImage);
      const contentRaw = stripMdxComments(fm.content).trim();
      const contentHtml = md.render(contentRaw);
      return {
        id,
        url: `/${collection}/${id}/`,
        collection,
        sourcePath: filePath,
        contentRaw,
        contentHtml,
        data: {
          ...data,
          heroImage: heroImageUrl,
          heroImagePath,
          // Normalize optional booleans so downstream templates can rely on real booleans.
          comments: data.comments ?? false,
          draft: data.draft ?? false,
        },
      };
    }),
  );
  return sortByPubDateDesc(parsed);
}

function getRunModeIsDev() {
  // Treat any non-prod run mode as development-like for content visibility defaults.
  // Prefer Eleventy mode, then Node env, then default to development.
  const runMode = process.env.ELEVENTY_RUN_MODE || process.env.NODE_ENV || "development";
  return !/prod/i.test(runMode);
}

async function buildStore() {
  // Build a shared content API consumed by page templates and feeds.
  const root = process.cwd();
  const reviewsDir = path.join(root, "src", "content", "reviews");
  const bossfeaturesDir = path.join(root, "src", "content", "bossfeatures");
  const [reviewsAll, bossfeaturesAll] = await Promise.all([
    loadCollection("reviews", reviewsDir, reviewsSchema),
    loadCollection("bossfeatures", bossfeaturesDir, bossfeaturesSchema),
  ]);
  const isDev = getRunModeIsDev();

  const api = {
    isDev,
    visibilityOptions: (isDevLike = isDev, overrides = {}) => visibilityOptions(isDevLike, overrides),
    isTemplateContentEntry,
    isDraftContentEntry,
    isFutureDatedContentEntry,
    isVisibleContentEntry,
    sortByPubDateDesc,
    sortByPubDateAsc,
    reviewsAll,
    bossfeaturesAll,
    // Getter helpers return filtered/sorted views without mutating the cached collections.
    getReviews(options = {}) {
      return sortByPubDateDesc(reviewsAll.filter((entry) => isVisibleContentEntry(entry, options)));
    },
    getBossFeatures(options = {}) {
      return sortByPubDateDesc(bossfeaturesAll.filter((entry) => isVisibleContentEntry(entry, options)));
    },
  };

  api.reviewsVisible = api.getReviews(api.visibilityOptions(isDev));
  api.bossfeaturesVisible = api.getBossFeatures(api.visibilityOptions(isDev));
  return api;
}

export default async function () {
  // Eleventy global data file entrypoint.
  return buildStore();
}
