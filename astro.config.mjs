// Astro build config. output: "static" means every page is pre-rendered at build time — no server.
// MDX enables .mdx content files; React enables client-side islands (LikeButton, SearchFilters, CommentsWidget).
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

export default defineConfig({
  site: process.env.SITE_URL ?? "https://katkronicles.com",
  integrations: [mdx(), react()],
  output: "static",
});
