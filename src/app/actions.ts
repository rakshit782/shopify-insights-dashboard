'use server';

import {
  generateProductSummary,
  type GenerateProductSummaryInput,
} from '@/ai/flows/generate-product-summary';
import { getShopifyProducts } from '@/lib/shopify-client';
import { syncProductsToWebsite } from '@/lib/website-supabase-client';

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

export async function handleSyncProducts() {
  try {
    const { products } = await getShopifyProducts();
    if (products.length === 0) {
      return { success: false, error: 'No products found to sync.' };
    }
    await syncProductsToWebsite(products);
    return { success: true, error: null, count: products.length };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
     console.error('Sync failed:', errorMessage);
    return { success: false, error: `Failed to sync products: ${errorMessage}` };
  }
}
