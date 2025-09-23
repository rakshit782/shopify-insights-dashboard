
'use server';

/**
 * @fileOverview An AI flow for optimizing product content for specific marketplaces.
 *
 * - optimizeContent - A function that takes content and a marketplace to return an optimized version.
 * - OptimizeContentInput - The input type for the optimizeContent function.
 * - OptimizeContentOutput - The return type for the optimizeContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MarketplaceEnum = z.enum(['google', 'amazon', 'walmart', 'ebay', 'etsy']);

const OptimizeContentInputSchema = z.object({
  title: z.string().describe('The current title of the product.'),
  description: z.string().describe('The current HTML description of the product.'),
  bulletPoints: z.array(z.string()).describe('A list of bullet points for the product.'),
  marketplace: MarketplaceEnum.describe('The target marketplace for optimization.'),
});
export type OptimizeContentInput = z.infer<typeof OptimizeContentInputSchema>;

const OptimizeContentOutputSchema = z.object({
  optimizedTitle: z.string().describe('The marketplace-specific optimized product title.'),
  optimizedDescription: z.string().describe('The marketplace-specific optimized product description in simple HTML.'),
  optimizedBulletPoints: z.array(z.string()).describe('The marketplace-specific optimized list of bullet points.'),
});
export type OptimizeContentOutput = z.infer<typeof OptimizeContentOutputSchema>;

export async function optimizeContent(input: OptimizeContentInput): Promise<OptimizeContentOutput> {
  return optimizeContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeContentPrompt',
  input: { schema: OptimizeContentInputSchema },
  output: { schema: OptimizeContentOutputSchema },
  prompt: `You are a world-class e-commerce copywriter and SEO expert specializing in the "{{marketplace}}" marketplace.
Your task is to rewrite a product's title, description, and bullet points to be perfectly optimized for discoverability and conversion on {{marketplace}}.

**Marketplace Guidelines for {{marketplace}}:**
- Amazon: Focus on keyword density in the title, feature-benefit bullet points, and a clear, concise A+ style description.
- Walmart: Similar to Amazon, but with slightly more emphasis on competitive pricing and value propositions.
- eBay: Titles are critical. Use keywords and include item specifics. The description can be longer and more detailed.
- Etsy: Emphasize craftsmanship, uniqueness, and materials. Use creative, descriptive language that tells a story.
- Google: Follow standard SEO best practices. Titles under 60 chars, meta description style for the main description, focus on primary keywords.

**Analyze the following product information:**
- Current Title: {{{title}}}
- Current Description: {{{description}}}
- Current Bullet Points:
{{#each bulletPoints}}
- {{{this}}}
{{/each}}

**Your Task:**
Generate an 'optimizedTitle', 'optimizedDescription', and 'optimizedBulletPoints' based on the product information, strictly following the guidelines for the '{{marketplace}}' marketplace. The description should be simple HTML.

Return ONLY the JSON object with the specified fields.
`,
});

const optimizeContentFlow = ai.defineFlow(
  {
    name: 'optimizeContentFlow',
    inputSchema: OptimizeContentInputSchema,
    outputSchema: OptimizeContentOutputSchema,
  },
  async (input) => {
    // Basic cleanup of HTML description before sending to the model
    const cleanDescription = input.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    const { output } = await prompt({
        ...input,
        description: cleanDescription,
    });
    return output!;
  }
);
