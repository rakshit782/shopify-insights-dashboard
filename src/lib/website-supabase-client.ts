
import 'dotenv/config';
import type { ShopifyProduct } from './types';
import { createSupabaseServerClient } from './supabase/server';

const BATCH_SIZE = 50;

export async function syncProductsToWebsite(products: ShopifyProduct[]): Promise<void> {
    const supabase = createSupabaseServerClient('DATA');
    console.log(`Syncing ${products.length} products to website.`);
    
    // In a real implementation, you'd want more robust error handling per batch
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const batch = products.slice(i, i + BATCH_SIZE);
        const productsToUpsert = batch.map(p => ({
            id: p.admin_graphql_api_id, // Use GraphQL ID as the primary key
            handle: p.handle,
            shopify_data: p, // Store the entire raw product object
            last_synced: new Date().toISOString()
        }));

        const { error } = await supabase
            .from('products')
            .upsert(productsToUpsert, { onConflict: 'id' });

        if (error) {
            console.error(`Error syncing batch of ${batch.length} products:`, error);
            // Decide if you want to throw or continue
            throw new Error(`Failed to sync a batch of products: ${error.message}`);
        } else {
             console.log(`Successfully synced batch of ${batch.length} products.`);
        }
    }
}


export async function getWebsiteProducts(): Promise<{ rawProducts: ShopifyProduct[], logs: string[] }> {
    const logs: string[] = [];
    const supabase = createSupabaseServerClient('DATA');
    logs.push('Fetching website products from DATA database...');
    
    const { data, error } = await supabase
        .from('products')
        .select('shopify_data') // Select only the column with the raw Shopify data
        .order('shopify_data->>updated_at', { ascending: false });

    if (error) {
        logs.push(`Error fetching website products: ${error.message}`);
        return { rawProducts: [], logs };
    }
    
    // The result is an array of objects like [{ shopify_data: {...} }, { shopify_data: {...} }]
    // We need to map it to an array of product objects.
    const products: ShopifyProduct[] = data.map(item => item.shopify_data);

    logs.push(`Successfully fetched ${products.length} products from website database.`);

    return { rawProducts: products, logs };
}

export async function getWebsiteProductCount(logs: string[]): Promise<number> {
    const supabase = createSupabaseServerClient('DATA');
    logs.push('Fetching website product count from DATA database...');
    const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    if (error) {
        logs.push(`Error fetching product count: ${error.message}`);
        return 0;
    }
    
    return count || 0;
}
    


    