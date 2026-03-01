import path from "node:path";
import { renderImage } from "./images.js";
import { escapeAttr, escapeHtml, token, cls } from "./html.js";

// Re-export common helpers so templates/page data can import from one place.
export { escapeAttr, escapeHtml, token, cls };

export function formatDate(date) {
  // Return an empty string for invalid/missing dates so templates stay resilient.
  if (!(date instanceof Date)) return "";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatMonthYear(date) {
  // Month+year format is used in archive cards and compact metadata rows.
  if (!(date instanceof Date)) return "";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatGenreLine(genres = [], release = "") {
  // Build a compact metadata line like "RPG / Action | 2024".
  const parts = [];
  // Append genre list and release window only when provided.
  if (genres.length) parts.push(genres.join(" / "));
  if (release) parts.push(release);
  return parts.join(" | ");
}

export function countThreadComments(commentSeeds, threadId) {
  // Count top-level comments plus one nested reply level.
  // Missing threads collapse to an empty array so counting logic stays simple.
  const comments = commentSeeds?.[threadId] ?? [];
  // Count each top-level comment plus any seeded replies (defaulting missing replies to 0).
  return comments.reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0);
}

export async function renderPostHeroImage(post, opts = {}) {
  // Render the canonical hero image for a content post if one is defined.
  // Gracefully omit the hero image if the post has no hero asset.
  if (!post?.data?.heroImagePath) return "";
  return renderImage(
    { fsPath: post.data.heroImagePath, url: post.data.heroImage },
    // Optional overrides fall back to safe defaults here.
    opts.alt ?? "",
    opts.imageOptions ?? {},
  );
}

export async function renderAssetImageFromSrc(relativeSrc, alt, options = {}) {
  // Convenience helper for non-content pages using local assets (e.g., About page).
  const fsPath = path.resolve(process.cwd(), relativeSrc);
  const url = `/${relativeSrc.replace(/^src\//, "").replace(/\\/g, "/")}`;
  return renderImage({ fsPath, url }, alt, options);
}

export function jsonForScript(value) {
  // Prevent accidental `</script>`-like breaks when embedding JSON in inline scripts.
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

// Maps boss-feature tags to visual badge classes in the layout.
export const bossTagClassMap = {
  memorable: "bf-tag-memorable",
  fair: "bf-tag-fair",
  spectacle: "bf-tag-spectacle",
  punishing: "bf-tag-punishing",
  narrative: "bf-tag-narrative",
  unfair: "bf-tag-unfair",
  forgettable: "bf-tag-forgettable",
};
