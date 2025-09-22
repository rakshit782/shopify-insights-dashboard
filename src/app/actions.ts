'use server';

import {
  generateProductSummary,
  type GenerateProductSummaryInput,
} from '@/ai/flows/generate-product-summary';

export async function handleGenerateSummary(input: GenerateProductSummaryInput) {
  try {
    const result = await generateProductSummary(input);
    return { summary: result.summary, error: null };
  } catch (e) {
    console.error(e);
    // It's better to return a generic error message to the user
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { summary: null, error: `Failed to generate summary: ${errorMessage}` };
  }
}
