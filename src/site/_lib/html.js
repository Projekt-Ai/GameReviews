// Small HTML/string helpers shared across build-time utilities.
export function escapeHtml(value) {
  // `null`/`undefined` become empty strings before escaping.
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

export function cls(...parts) {
  // Join truthy class fragments into one class attribute string.
  return parts.filter(Boolean).join(" ");
}

export function token(value) {
  // Normalize a label into a slug-like token for CSS/data attributes.
  // Nullish values become an empty string before normalization.
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toPosix(value) {
  // Normalize Windows paths for URLs/ids and cross-platform comparisons.
  return String(value).replace(/\\/g, "/");
}
