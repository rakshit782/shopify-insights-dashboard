import 'dotenv/config';
import type { ShopifyProduct } from './types';
import { createClient } from '@supabase/supabase-js';

const BATCH_SIZE = 50;

export async function syncProductsToWebsite(products: ShopifyProduct[]): Promise<void> {
    const supabaseUrl = process.env.WEBSITE_SUPABASE_URL;
    const supabaseKey = process.env.WEBSITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Website Supabase URL or Service Role Key is not configured.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const productsToUpsert = products.map(p => ({
        id: p.admin_graphql_api_id, // Use the GraphQL API ID as the primary key
        handle: p.handle,
        shopify_data: p, // Store the entire raw product object
    }));

    for (let i = 0; i < productsToUpsert.length; i += BATCH_SIZE) {
        const batch = productsToUpsert.slice(i, i + BATCH_SIZE);
        
        const { error } = await supabase
            .from('products')
            .upsert(batch, { onConflict: 'id' });

        if (error) {
            throw new Error(`Failed to sync batch starting at index ${i}: ${error.message}`);
        }
    }
}


export async function getWebsiteProducts(): Promise<{ rawProducts: ShopifyProduct[], logs: string[] }> {
    const logs: string[] = [];
    const supabaseUrl = process.env.WEBSITE_SUPABASE_URL;
    const supabaseKey = process.env.WEBSITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        logs.push('Website Supabase URL or key is not configured.');
        throw new Error('Website Supabase credentials are not configured.');
    }

    logs.push('Creating website Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    logs.push("Fetching products from 'products' table...");
    const { data, error } = await supabase
        .from('products')
        .select('shopify_data');

    if (error) {
        logs.push(`Supabase error: ${error.message}`);
        throw new Error(`Failed to fetch products from website DB: ${error.message}`);
    }

    if (!data) {
        logs.push('No products found in website database.');
        return { rawProducts: [], logs };
    }

    const products = data.map(item => item.shopify_data);
    logs.push(`Successfully fetched ${products.length} products from website database.`);

    return { rawProducts: products as ShopifyProduct[], logs };
}
