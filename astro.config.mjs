import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

export default defineConfig({
  site: process.env.SITE_URL ?? "https://katkronicles.com",
  integrations: [mdx(), react()],
  output: "static",
});
