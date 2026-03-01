import path from "node:path";
import { fileURLToPath } from "node:url";

// Recreate CommonJS-style path helpers for ESM config files.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function (eleventyConfig) {
  // Copy static assets straight to the output folder.
  eleventyConfig.addPassthroughCopy({ public: "/" });
  eleventyConfig.addPassthroughCopy({ "src/styles": "styles" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Watch content/styles/scripts during local development.
  eleventyConfig.addWatchTarget("./src/content/");
  eleventyConfig.addWatchTarget("./src/styles/");
  eleventyConfig.addWatchTarget("./public/js/");

  // Template filters used across Nunjucks layouts/pages.
  eleventyConfig.addFilter("formatDate", (date) => {
    // Return an empty string instead of throwing on invalid values.
    if (!(date instanceof Date)) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  });

  eleventyConfig.addFilter("formatMonthYear", (date) => {
    // Same guard for month+year formatting.
    if (!(date instanceof Date)) return "";
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  });

  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));

  eleventyConfig.addFilter("isActiveNav", (currentUrl = "/", href = "/") => {
    const normalize = (v) => (String(v || "/").replace(/\/+$/, "") || "/");
    const current = normalize(currentUrl);
    const target = normalize(href);
    // Root should only match exactly; other links match exact or nested paths.
    if (target === "/") return current === "/";
    return current === target || current.startsWith(`${target}/`);
  });

  // Build metadata used in templates, feeds, and footer text.
  eleventyConfig.addGlobalData("build", {
    // Netlify-style env vars are optional; local builds fall back to readable defaults.
    commit: process.env.COMMIT_REF?.slice(0, 7) ?? "local",
    context: process.env.CONTEXT ?? "local",
    siteUrl: process.env.SITE_URL ?? "https://example.com",
    year: new Date().getFullYear(),
  });

  // Eleventy project directory/layout settings.
  return {
    dir: {
      input: "src/site",
      includes: "_includes",
      data: "_data",
      output: "dist",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "11ty.js"],
    pathPrefix: "/",
  };
}
