
import 'dotenv/config';
import type { ShopifyProduct } from './types';
import { createClient } from '@/lib/supabase/server';

const BATCH_SIZE = 50;

export async function syncProductsToWebsite(products: ShopifyProduct[]): Promise<void> {
    const supabase = await createClient({ db: 'DATA' });

    const productsToUpsert = products.map(p => ({
        id: p.admin_graphql_api_id, // Use the GraphQL API ID as the primary key
        shopify_product_id: p.id,
        handle: p.handle,
        title: p.title,
        body_html: p.body_html,
        vendor: p.vendor,
        product_type: p.product_type,
        created_at: p.created_at,
        updated_at: p.updated_at,
        published_at: p.published_at,
        status: p.status,
        tags: p.tags,
        // Store complex objects as JSON in their own columns
        variants: p.variants,
        options: p.options,
        images: p.images,
        image: p.image,
    }));

    for (let i = 0; i < productsToUpsert.length; i += BATCH_SIZE) {
        const batch = productsToUpsert.slice(i, i + BATCH_SIZE);
        
        const { error } = await supabase
            .from('products')
            .upsert(batch, { onConflict: 'id' });

        if (error) {
            console.error('Supabase upsert error:', error);
            throw new Error(`Failed to sync batch starting at index ${i}: ${error.message}`);
        }
    }
}


export async function getWebsiteProducts(): Promise<{ rawProducts: ShopifyProduct[], logs: string[] }> {
    const logs: string[] = [];
    
    logs.push('Creating website Supabase client...');
    const supabase = await createClient({ db: 'DATA' });

    logs.push("Fetching products from 'products' table...");
    // Select all the individual columns
    const { data, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        logs.push(`Supabase error: ${error.message}`);
        throw new Error(`Failed to fetch products from website DB: ${error.message}`);
    }

    if (!data) {
        logs.push('No products found in website database.');
        return { rawProducts: [], logs };
    }

    // Reconstruct the ShopifyProduct object from the individual columns
    const products: ShopifyProduct[] = data.map(item => ({
        id: item.shopify_product_id,
        admin_graphql_api_id: item.id,
        title: item.title,
        body_html: item.body_html,
        vendor: item.vendor,
        product_type: item.product_type,
        created_at: item.created_at,
        handle: item.handle,
        updated_at: item.updated_at,
        published_at: item.published_at,
        template_suffix: item.template_suffix, // Note: this field might be null if not synced
        published_scope: item.published_scope, // Note: this field might be null if not synced
        tags: item.tags,
        status: item.status,
        variants: item.variants,
        options: item.options,
        images: item.images,
        image: item.image,
    }));

    logs.push(`Successfully fetched ${products.length} products from website database.`);

    return { rawProducts: products, logs };
}

    