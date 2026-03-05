import blogPlaceholder1 from "../assets/blog-placeholder-1.jpg";
import blogPlaceholder2 from "../assets/blog-placeholder-2.jpg";
import blogPlaceholder3 from "../assets/blog-placeholder-3.jpg";
import blogPlaceholder4 from "../assets/blog-placeholder-4.jpg";
import blogPlaceholder5 from "../assets/blog-placeholder-5.jpg";
import blogPlaceholderAbout from "../assets/blog-placeholder-about.jpg";
import e33Thumbnail from "../assets/images/e33-thumbnail.jpg";
import goty2022Thumbnail from "../assets/images/goty2022thumbnail.png";
import goty2023Thumbnail from "../assets/images/goty2023thumbnail.png";
import goty2024Thumbnail from "../assets/images/goty2024thumbnail.png";
import goty2025Thumbnail from "../assets/images/goty2025thumbnail.png";
import metaphorThumbnail from "../assets/images/metaphor-thumbnail.jpg";
import persona5Thumbnail from "../assets/images/persona5-thumbnail.jpg";
import xc3Illustration from "../assets/images/XC3Illustration.jpg";

const imageAssets = new Map([
  ["blog-placeholder-1.jpg", blogPlaceholder1],
  ["blog-placeholder-2.jpg", blogPlaceholder2],
  ["blog-placeholder-3.jpg", blogPlaceholder3],
  ["blog-placeholder-4.jpg", blogPlaceholder4],
  ["blog-placeholder-5.jpg", blogPlaceholder5],
  ["blog-placeholder-about.jpg", blogPlaceholderAbout],
  ["e33-thumbnail.jpg", e33Thumbnail],
  ["goty2022thumbnail.png", goty2022Thumbnail],
  ["goty2023thumbnail.png", goty2023Thumbnail],
  ["goty2024thumbnail.png", goty2024Thumbnail],
  ["goty2025thumbnail.png", goty2025Thumbnail],
  ["metaphor-thumbnail.jpg", metaphorThumbnail],
  ["persona5-thumbnail.jpg", persona5Thumbnail],
  ["xc3illustration.jpg", xc3Illustration],
]);

function normalizeImageKey(path) {
  if (!path) return "";
  return String(path)
    .replaceAll("\\", "/")
    .split("/")
    .filter(Boolean)
    .pop()
    ?.toLowerCase() ?? "";
}

export function getImageAsset(path, fallback = blogPlaceholder1) {
  return imageAssets.get(normalizeImageKey(path)) ?? fallback;
}

export const fallbackCardImage = blogPlaceholder1;
