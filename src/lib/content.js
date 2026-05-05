// Central data-access layer. All content queries (reviews, boss features, GOTY picks) flow through here.
// Also exports shared formatting helpers and siteConfig used across pages and layouts.
import { getCollection } from "astro:content";

export const siteConfig = {
  title: "Kat's Kronicles",
  description: "Personal game reviews and boss fight essays by Kat — an appreciation for games as a medium and what makes each one great.",
  url: process.env.SITE_URL ?? "https://katkronicles.com",
};

function isTemplateEntry(entry) {
  return entry.id.startsWith("_");
}

function isFutureEntry(entry, now = new Date()) {
  return entry.data.pubDate.valueOf() > now.valueOf();
}

// draft and future-date checks are prod-only so you can preview unpublished content in dev
function isVisibleEntry(entry) {
  if (isTemplateEntry(entry)) return false;
  if (entry.data.draft && import.meta.env.PROD) return false;
  if (isFutureEntry(entry) && import.meta.env.PROD) return false;
  return true;
}

function sortByPubDateDesc(entries) {
  return [...entries].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getVisibleReviews() {
  const entries = await getCollection("reviews", (entry) => isVisibleEntry(entry));
  return sortByPubDateDesc(entries);
}

// intentionally skips draft/future filter — GOTY picks are all-time and shouldn't disappear if a review is still a draft
export async function getGotyReviews() {
  const entries = await getCollection("reviews", (entry) => {
    if (isTemplateEntry(entry)) return false;
    if (!entry.data.gotyYear) return false;
    return true;
  });
  return sortByPubDateDesc(entries);
}

export async function getVisibleBossFeatures() {
  const entries = await getCollection("bossfeatures", (entry) => isVisibleEntry(entry));
  return sortByPubDateDesc(entries);
}

export function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatMonthYear(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function toAssetUrl(path) {
  if (!path) return "";
  return path.replace(/^(\.\.\/)+/, "/");
}

export function formatGenreLine(genres = [], release = "") {
  const parts = [];
  if (genres.length > 0) parts.push(genres.join(" / "));
  if (release) parts.push(release);
  return parts.join(" | ");
}
