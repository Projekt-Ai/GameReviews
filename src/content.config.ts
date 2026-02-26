import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const reviews = defineCollection({
	// Load Markdown and MDX files in the `src/content/reviews/` directory.
	loader: glob({ base: './src/content/reviews', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			// Known theme variants — controls fonts and CSS styling per review
			theme: z.enum(['default', 'e33', 'metaphor', 'xc3']).optional(),
			feature: z.boolean().optional(),
			comments: z.boolean().default(false),
			draft: z.boolean().default(false),
			// GOTY fields — only present on Game of the Year entries
			gotyYear: z.number().int().optional(),
			platforms: z
				.array(z.object({ name: z.string(), played: z.boolean().optional() }))
				.optional(),
			genres: z.array(z.string()).optional(),
			release: z.string().optional(),
			blurb: z.string().optional(),
			imageCredit: z.string().optional(),
		}),
});

const bossfeatures = defineCollection({
	loader: glob({ base: './src/content/bossfeatures', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			draft: z.boolean().default(false),
			game: z.string(),
			bossType: z.enum(['Story Boss', 'Optional', 'Mini-Boss', 'Challenge']),
			attempts: z.number().int().optional(),
			verdict: z.string().optional(),
			verdictTone: z.enum(['positive', 'negative', 'mixed']).optional(),
			verdictText: z.string().optional(),
			spoilerLevel: z.string().optional(),
			hoursIn: z.string().optional(),
			chapter: z.string().optional(),
			platforms: z
				.array(z.object({ name: z.string(), played: z.boolean().optional() }))
				.optional(),
			blurb: z.string().optional(),
			imageCredit: z.string().optional(),
			tags: z.array(z.string()).optional(),
		}),
});

export const collections = { reviews, bossfeatures };
