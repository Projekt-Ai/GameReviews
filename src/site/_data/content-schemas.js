import { z } from "zod";

// Shared nested schema for platform labels in front matter.
const platformSchema = z.object({
  name: z.string(),
  played: z.boolean().optional(),
});

// Front matter schema for review content entries.
export const reviewsSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  heroImage: z.string().optional(),
  theme: z.enum(["default", "e33", "metaphor", "xc3"]).optional(),
  feature: z.boolean().optional(),
  comments: z.boolean().default(false),
  draft: z.boolean().default(false),
  gotyYear: z.number().int().optional(),
  platforms: z.array(platformSchema).optional(),
  genres: z.array(z.string()).optional(),
  release: z.string().optional(),
  blurb: z.string().optional(),
  imageCredit: z.string().optional(),
});

// Front matter schema for boss feature content entries.
export const bossfeaturesSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  heroImage: z.string().optional(),
  draft: z.boolean().default(false),
  comments: z.boolean().default(false),
  game: z.string(),
  bossType: z.enum(["Story Boss", "Optional", "Mini-Boss", "Challenge"]),
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
});
