
'use server';

import {
  generateProductSummary,
  type GenerateProductSummaryInput,
} from '@/ai/flows/generate-product-summary';
import { getShopifyProducts, createShopifyProduct, updateShopifyProduct, getShopifyProduct } from '@/lib/shopify-client';
import { syncProductsToWebsite } from '@/lib/website-supabase-client';
import type { ShopifyProductCreation, ShopifyProduct, ShopifyProductUpdate } from '@/lib/types';


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
    // We now get the rawProducts array from the API response
    const { rawProducts } = await getShopifyProducts();
    if (rawProducts.length === 0) {
      return { success: false, error: 'No products found to sync.' };
    }
    // We pass the raw, complete product objects to the sync function
    await syncProductsToWebsite(rawProducts);
    return { success: true, error: null, count: rawProducts.length };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
     console.error('Sync failed:', errorMessage);
    return { success: false, error: `Failed to sync products: ${errorMessage}` };
  }
}

export async function handleCreateProduct(productData: ShopifyProductCreation) {
  try {
    // Create product in Shopify
    const { product: newShopifyProduct } = await createShopifyProduct(productData);
    
    // Sync the newly created product to our website's Supabase
    await syncProductsToWebsite([newShopifyProduct]);

    return { success: true, error: null, product: newShopifyProduct };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Product creation failed:', errorMessage);
    return { success: false, error: `Failed to create product: ${errorMessage}` };
  }
}

export async function handleUpdateProduct(productData: ShopifyProductUpdate) {
  try {
    // Update product in Shopify
    const { product: updatedShopifyProduct } = await updateShopifyProduct(productData);

    // Re-sync the updated product to our website's Supabase
    await syncProductsToWebsite([updatedShopifyProduct]);

    return { success: true, error: null, product: updatedShopifyProduct };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Product update failed:', errorMessage);
    return { success: false, error: `Failed to update product: ${errorMessage}` };
  }
}

export async function handleGetProduct(id: number) {
  try {
    const { product } = await getShopifyProduct(id);
    if (!product) {
      return { product: null, error: `Product with ID ${id} not found.`};
    }
    return { product, error: null };
  } catch (e) {
     const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Get product failed:', errorMessage);
    return { product: null, error: `Failed to retrieve product: ${errorMessage}` };
  }
}
