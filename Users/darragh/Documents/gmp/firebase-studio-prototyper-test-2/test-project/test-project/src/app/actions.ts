
'use server';

import { getShopifyProducts, createShopifyProduct, updateShopifyProduct, getShopifyProduct, saveShopifyCredentials, saveAmazonCredentials, saveWalmartCredentials, saveEbayCredentials, saveEtsyCredentials, saveWayfairCredentials, getCredentialStatuses } from '@/lib/shopify-client';
import { syncProductsToWebsite } from '@/lib/website-supabase-client';
import type { ShopifyProductCreation, ShopifyProduct, ShopifyProductUpdate, AmazonCredentials, WalmartCredentials, EbayCredentials, EtsyCredentials, WayfairCredentials } from '@/lib/types';

export async function handleSyncProducts() {
  try {
    // We now get the rawProducts array from the API response
    const { rawProducts } = await getShopifyProducts();
    if (!rawProducts || rawProducts.length === 0) {
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

export async function handleGetCredentialStatuses() {
    try {
        const statuses = await getCredentialStatuses();
        return { success: true, statuses, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to get credential statuses:', errorMessage);
        return { success: false, statuses: {}, error: `Failed to get statuses: ${errorMessage}` };
    }
}

export async function handleSaveShopifyCredentials(storeName: string, accessToken: string) {
    try {
        await saveShopifyCredentials(storeName, accessToken);
        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to save Shopify credentials:', errorMessage);
        return { success: false, error: `Failed to save credentials: ${errorMessage}` };
    }
}

export async function handleSaveAmazonCredentials(credentials: AmazonCredentials) {
    try {
        await saveAmazonCredentials(credentials);
        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to save Amazon credentials:', errorMessage);
        return { success: false, error: `Failed to save credentials: ${errorMessage}` };
    }
}

export async function handleSaveWalmartCredentials(credentials: WalmartCredentials) {
    try {
        await saveWalmartCredentials(credentials);
        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to save Walmart credentials:', errorMessage);
        return { success: false, error: `Failed to save credentials: ${errorMessage}` };
    }
}

export async function handleSaveEbayCredentials(credentials: EbayCredentials) {
    try {
        await saveEbayCredentials(credentials);
        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to save eBay credentials:', errorMessage);
        return { success: false, error: `Failed to save credentials: ${errorMessage}` };
    }
}

export async function handleSaveEtsyCredentials(credentials: EtsyCredentials) {
    try {
        await saveEtsyCredentials(credentials);
        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to save Etsy credentials:', errorMessage);
        return { success: false, error: `Failed to save credentials: ${errorMessage}` };
    }
}

export async function handleSaveWayfairCredentials(credentials: WayfairCredentials) {
    try {
        await saveWayfairCredentials(credentials);
        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to save Wayfair credentials:', errorMessage);
        return { success: false, error: `Failed to save credentials: ${errorMessage}` };
    }
}
