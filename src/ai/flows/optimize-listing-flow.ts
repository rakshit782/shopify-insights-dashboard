
'use server';

/**
 * @fileOverview An AI flow for optimizing product listings for SEO.
 *
 * - optimizeListing - A function that takes product data and returns an SEO-optimized title and description.
 * - OptimizeListingInput - The input type for the optimizeListing function.
 * - OptimizeListingOutput - The return type for the optimizeListing function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const OptimizeListingInputSchema = z.object({
  title: z.string().describe('The current title of the product.'),
  description: z.string().describe('The current HTML description of the product.'),
  vendor: z.string().describe('The vendor or brand of the product.'),
  productType: z.string().describe('The category or type of the product.'),
  tags: z.string().optional().describe('Comma-separated list of tags associated with the product.'),
});
export type OptimizeListingInput = z.infer<typeof OptimizeListingInputSchema>;

const OptimizeListingOutputSchema = z.object({
  optimizedTitle: z.string().describe('The SEO-optimized product title. It should be concise, keyword-rich, and under 60 characters.'),
  optimizedDescription: z.string().describe('The SEO-optimized product description. It should be a compelling, keyword-rich HTML description of around 160 characters that persuades users to click.'),
});
export type OptimizeListingOutput = z.infer<typeof OptimizeListingOutputSchema>;

export async function optimizeListing(input: OptimizeListingInput): Promise<OptimizeListingOutput> {
  return optimizeListingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeListingPrompt',
  input: { schema: OptimizeListingInputSchema },
  output: { schema: OptimizeListingOutputSchema },
  prompt: `You are an SEO expert and a world-class copywriter specializing in e-commerce.
Your task is to rewrite a product title and description to maximize its visibility and click-through rate on Google search results.

Analyze the following product information:
- Current Title: {{{title}}}
- Current Description: {{{description}}}
- Vendor: {{{vendor}}}
- Product Type: {{{productType}}}
{{#if tags}}- Tags: {{{tags}}}{{/if}}

Based on this information, generate the following:

1.  **Optimized Title**:
    - Must be under 60 characters.
    - Must be highly relevant to the product.
    - Should include the most important keywords that potential customers would use to search for this product.
    - Should be compelling and encourage clicks.
    - Format: Start with the primary keyword, followed by key features or benefits, and end with the brand name.

2.  **Optimized Description**:
    - Must be a meta description of around 160 characters.
    - Must be written in engaging, persuasive language.
    - Should expand on the title and include secondary keywords naturally.
    - Should highlight the main benefit or unique selling proposition.
    - Must end with a strong call to action.
    - The description should be valid HTML, but simple (e.g., using <p> tags, maybe <strong> for emphasis). Do not include <html> or <body> tags.

Return ONLY the JSON object with the 'optimizedTitle' and 'optimizedDescription' fields.
`,
});

const optimizeListingFlow = ai.defineFlow(
  {
    name: 'optimizeListingFlow',
    inputSchema: OptimizeListingInputSchema,
    outputSchema: OptimizeListingOutputSchema,
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
