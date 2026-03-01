import path from "node:path";
import { escapeAttr } from "./html.js";

let imageModulePromise;

async function getEleventyImg() {
  // Lazy-load eleventy-img so builds still work if the module is unavailable.
  // Cache the dynamic import so repeated image renders don't re-import the module.
  if (!imageModulePromise) {
    imageModulePromise = import("@11ty/eleventy-img").catch(() => null);
  }
  return imageModulePromise;
}

function inferWebUrl(src) {
  // Extract a browser URL from either a string or `{ fsPath, url }` source object.
  // Accept either a direct string URL or a `{ fsPath, url }` image source object.
  if (!src) return "";
  if (typeof src === "object" && src.url) return src.url;
  return String(src);
}

export async function renderImage(src, alt, options = {}) {
  // Render responsive image HTML via eleventy-img, with a plain `<img>` fallback.
  const {
    widths = [640, 960, 1280],
    sizes = "100vw",
    className = "",
    loading = "lazy",
    decoding = "async",
    fetchpriority,
    width,
    height,
  } = options;

  // Prefer a filesystem path for optimization; fall back to the URL/string source.
  const srcPath = typeof src === "object" ? src.fsPath ?? src.url : src;
  const fallbackUrl = inferWebUrl(src);
  // No source path means render a placeholder element instead of an image.
  if (!srcPath) {
    // Preserve layout when no image exists.
    return `<div class="${escapeAttr(className)}" aria-hidden="true"></div>`;
  }

  const eleventyImgModule = await getEleventyImg();
  // Fall back to a plain `<img>` when optimization is unavailable.
  if (!eleventyImgModule?.default || typeof srcPath !== "string") {
    // Fallback path when image processing is unavailable (or source is URL-only).
    const attrs = [
      `src="${escapeAttr(fallbackUrl)}"`,
      // Empty alt text is allowed and explicitly emitted when alt is nullish.
      `alt="${escapeAttr(alt ?? "")}"`,
      // Only include optional attributes when values are provided.
      className ? `class="${escapeAttr(className)}"` : "",
      loading ? `loading="${escapeAttr(loading)}"` : "",
      decoding ? `decoding="${escapeAttr(decoding)}"` : "",
      fetchpriority ? `fetchpriority="${escapeAttr(fetchpriority)}"` : "",
      width ? `width="${escapeAttr(width)}"` : "",
      height ? `height="${escapeAttr(height)}"` : "",
    ]
      .filter(Boolean)
      .join(" ");
    return `<img ${attrs}>`;
  }

  const Image = eleventyImgModule.default;
  // Generate optimized image variants into `dist/img`.
  // Accept both absolute and project-relative source paths.
  const imageSrc = path.isAbsolute(srcPath) ? srcPath : path.resolve(process.cwd(), srcPath);
  const metadata = await Image(imageSrc, {
    widths,
    formats: ["avif", "webp", "jpeg"],
    outputDir: path.join(process.cwd(), "dist", "img"),
    urlPath: "/img/",
    sharpOptions: { animated: true },
  });

  return Image.generateHTML(metadata, {
    // `undefined` omits optional attributes from Eleventy Image's generated markup.
    alt: alt ?? "",
    sizes,
    class: className || undefined,
    loading,
    decoding,
    fetchpriority,
    width,
    height,
  });
}

export function publicAssetFromFsPath(fsPath) {
  // Convert a local `src/assets/...` file path to its public `/assets/...` URL.
  // Normalize unknown/falsy inputs to a string before path conversion.
  const normalized = String(fsPath || "").replace(/\\/g, "/");
  const idx = normalized.indexOf("/src/assets/");
  // Convert `/.../src/assets/...` to `/assets/...` when possible.
  if (idx >= 0) return normalized.slice(idx + "/src".length);
  return normalized;
}
