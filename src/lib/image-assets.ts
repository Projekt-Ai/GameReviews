// Centralises image imports so MDX frontmatter can reference images by filename string.
// Astro requires static imports for optimisation, so import.meta.glob loads every asset
// up-front and stores them in a Map keyed by filename.
import type { ImageMetadata } from "astro";

const imageModules = import.meta.glob<ImageMetadata>("../assets/**/*.{jpg,jpeg,png,webp,avif,gif}", {
  eager: true,
  import: "default",
});

// Windows paths may use backslashes; normalise to a lowercase filename so the Map key is
// consistent across dev (Windows) and CI/production (Linux).
function normalizeImageKey(path: unknown): string {
  if (!path) return "";
  return String(path)
    .replaceAll("\\", "/")
    .split("/")
    .filter(Boolean)
    .pop()
    ?.toLowerCase() ?? "";
}

const imageAssets = new Map<string, ImageMetadata>(
  Object.entries(imageModules).map(([path, asset]) => [normalizeImageKey(path), asset]),
);

// Used site-wide whenever an image path is missing or can't be resolved.
export const fallbackCardImage = imageAssets.get("blog-placeholder-1.jpg") as ImageMetadata;

export function getImageAsset(path: unknown, fallback: ImageMetadata = fallbackCardImage): ImageMetadata {
  return imageAssets.get(normalizeImageKey(path)) ?? fallback;
}
