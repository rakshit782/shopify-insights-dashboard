
import 'dotenv/config';
import type { ShopifyProduct } from './types';

// This file now contains mock implementations as Supabase has been removed.

const BATCH_SIZE = 50;

export async function syncProductsToWebsite(products: ShopifyProduct[]): Promise<void> {
    console.log(`[MOCK] Syncing ${products.length} products to website.`);
    // In a real scenario, this would upsert to a database.
    // For now, we just log the action.
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const batch = products.slice(i, i + BATCH_SIZE);
        console.log(`[MOCK] Syncing batch of ${batch.length} products.`);
    }
}


export async function getWebsiteProducts(): Promise<{ rawProducts: ShopifyProduct[], logs: string[] }> {
    const logs: string[] = [];
    logs.push('[MOCK] Fetching website products...');
    
    // Returning an empty array as there is no database to fetch from.
    // In a real scenario with a DB, you would fetch all products here.
    const mockProducts: ShopifyProduct[] = []; 

    logs.push(`[MOCK] Successfully fetched ${mockProducts.length} products from website database.`);

    return { rawProducts: mockProducts, logs };
}

export async function getWebsiteProductCount(logs: string[]): Promise<number> {
    logs.push('[MOCK] Fetching website product count...');
    // Return 0 as there is no database.
    return 0;
}
    
