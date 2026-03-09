const imageModules = import.meta.glob("../assets/**/*.{jpg,jpeg,png,webp,avif,gif}", {
  eager: true,
  import: "default",
});

function normalizeImageKey(path) {
  if (!path) return "";
  return String(path)
    .replaceAll("\\", "/")
    .split("/")
    .filter(Boolean)
    .pop()
    ?.toLowerCase() ?? "";
}

const imageAssets = new Map(
  Object.entries(imageModules).map(([path, asset]) => [normalizeImageKey(path), asset]),
);

export const fallbackCardImage = imageAssets.get("blog-placeholder-1.jpg");

export function getImageAsset(path, fallback = fallbackCardImage) {
  return imageAssets.get(normalizeImageKey(path)) ?? fallback;
}
