import type { ImageMetadata } from "astro";

const imageModules = import.meta.glob<ImageMetadata>("../assets/**/*.{jpg,jpeg,png,webp,avif,gif}", {
  eager: true,
  import: "default",
});

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

export const fallbackCardImage = imageAssets.get("blog-placeholder-1.jpg") as ImageMetadata;

export function getImageAsset(path: unknown, fallback: ImageMetadata = fallbackCardImage): ImageMetadata {
  return imageAssets.get(normalizeImageKey(path)) ?? fallback;
}
