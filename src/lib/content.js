import { getCollection } from "astro:content";

export const siteConfig = {
  title: "Kat's Kronicles",
  description: "Welcome to my website!",
  url: process.env.SITE_URL ?? "https://katkronicles.com",
};

const isDev = import.meta.env.DEV;

function isTemplateEntry(entry) {
  return entry.id.startsWith("_");
}

function isFutureEntry(entry, now = new Date()) {
  return entry.data.pubDate.valueOf() > now.valueOf();
}

function isVisibleEntry(entry) {
  if (isTemplateEntry(entry)) return false;
  if (entry.data.draft && !isDev) return false;
  if (isFutureEntry(entry) && !isDev) return false;
  return true;
}

function sortByPubDateDesc(entries) {
  return [...entries].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getVisibleReviews() {
  const entries = await getCollection("reviews", (entry) => isVisibleEntry(entry));
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
