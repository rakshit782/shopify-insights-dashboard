
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
            shopify_product_id: p.id,
            handle: p.handle,
            title: p.title,
            body_html: p.body_html,
            vendor: p.vendor,
            product_type: p.product_type,
            status: p.status,
            tags: p.tags,
            created_at: p.created_at,
            updated_at: p.updated_at,
            published_at: p.published_at,
            variants: p.variants,
            options: p.options,
            images: p.images,
            image: p.image,
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
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) {
        logs.push(`Error fetching website products: ${error.message}`);
        return { rawProducts: [], logs };
    }
    
    // The result is an array of objects with individual columns.
    // We need to map it to an array of ShopifyProduct objects.
    const products: ShopifyProduct[] = data.map(item => ({
        id: item.shopify_product_id,
        admin_graphql_api_id: item.id,
        handle: item.handle,
        title: item.title,
        body_html: item.body_html,
        vendor: item.vendor,
        product_type: item.product_type,
        status: item.status,
        tags: item.tags,
        created_at: item.created_at,
        updated_at: item.updated_at,
        published_at: item.published_at,
        variants: item.variants,
        options: item.options,
        images: item.images,
        image: item.image,
        // Properties not in the db table but required by the type are filled with defaults
        template_suffix: '',
        published_scope: 'web', 
    }));

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
    


    
