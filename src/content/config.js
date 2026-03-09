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
    theme: z.enum(["default", "e33", "metaphor", "xc3", "cassette", "barrel"]).optional(),
    feature: z.boolean().optional(),
    comments: z.boolean().default(true),
    draft: z.boolean().default(false),
    gotyYear: z.number().int().optional(),
    platforms: z.array(platformSchema).optional(),
    genres: z.array(z.string()).optional(),
    release: z.string().optional(),
    price: z.string().optional(),
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

export const collections = {
  reviews,
  bossfeatures,
};
