// Zod schemas that Astro validates every piece of content frontmatter against.
// This file is the source of truth — adding or renaming a field here affects every review/boss feature.
import { defineCollection, z } from "astro:content";

const platformSchema = z.object({
  name: z.string(),
  played: z.boolean().optional(),
});

const reviews = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    // each variant loads matching CSS in review-post-variants.css; e33 also loads extra Google Fonts
    theme: z.enum(["default", "e33", "metaphor", "xc3", "cassette", "barrel"]).optional(),
    // feature: true adds the .featured CSS modifier (larger card treatment on listing pages)
    feature: z.boolean().optional(),
    // only one review should have highlight: true — drives the "Year's Highlight" panel on the home page
    highlight: z.boolean().default(false),
    comments: z.boolean().default(true),
    draft: z.boolean().default(false),
    // presence of gotyYear is what makes a review appear in the GOTY carousel on the home page
    gotyYear: z.number().int().optional(),
    platforms: z.array(platformSchema).optional(),
    genres: z.array(z.string()).optional(),
    release: z.string().optional(),
    price: z.string().optional(),
    headline: z.string().optional(),
    blurb: z.string().optional(),
    imageCredit: z.string().optional(),
    related: z.array(z.string()).optional(),
  }),
});

const bossfeatures = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    draft: z.boolean().default(false),
    // boss features default comments off (unlike reviews); enable per-post by setting comments: true
    comments: z.boolean().default(false),
    game: z.string(),
    bossType: z.enum(["Story Boss", "Optional", "Mini-Boss", "Challenge", "Encounter"]),
    attempts: z.number().int().optional(),
    verdict: z.string().optional(),
    verdictTone: z.enum(["positive", "negative", "mixed"]).optional(),
    verdictText: z.string().optional(),
    spoilerLevel: z.string().optional(),
    hoursIn: z.string().optional(),
    chapter: z.string().optional(),
    platforms: z.array(platformSchema).optional(),
    blurb: z.string().optional(),
    imageCredit: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const excited = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    draft: z.boolean().default(false),
    comments: z.boolean().default(true),
    // "Demo Played" = hands-on impressions; "Wishlist" = pure anticipation; "Early Access" = ongoing
    status: z.enum(["Demo Played", "Wishlist", "Early Access", "Coming Soon"]).default("Wishlist"),
    developer: z.string().optional(),
    releaseDate: z.string().optional(),
    platforms: z.array(platformSchema).optional(),
    genres: z.array(z.string()).optional(),
    headline: z.string().optional(),
    blurb: z.string().optional(),
    imageCredit: z.string().optional(),
  }),
});

export const collections = {
  reviews,
  bossfeatures,
  excited,
};
