
import 'dotenv/config';
import type { ShopifyProduct } from './types';
import { createClient } from '@supabase/supabase-js';

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

    const { error } = await supabase
        .from('products')
        .upsert(productsToUpsert, { onConflict: 'id' });

    if (error) {
        throw new Error(`Failed to sync products to website: ${error.message}`);
    }
}
