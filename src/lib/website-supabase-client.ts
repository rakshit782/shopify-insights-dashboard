

import type { ShopifyProduct } from './types';
import { createSupabaseServerClient } from './supabase/server';

const BATCH_SIZE = 50;
const FETCH_BATCH_SIZE = 1000; // For fetching from Supabase

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
    logs.push('Fetching all website products from DATA database with pagination...');
    
    let allProductsData: any[] = [];
    let page = 0;
    let hasMore = true;

    while(hasMore) {
        const from = page * FETCH_BATCH_SIZE;
        const to = from + FETCH_BATCH_SIZE - 1;
        
        logs.push(`Fetching products from range: ${from} to ${to}`);
        
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('updated_at', { ascending: false })
            .range(from, to);

        if (error) {
            logs.push(`Error fetching website products on page ${page}: ${error.message}`);
            // Stop fetching on error
            hasMore = false; 
            break;
        }

        if (data && data.length > 0) {
            allProductsData.push(...data);
            logs.push(`Fetched ${data.length} products. Total so far: ${allProductsData.length}`);
            if (data.length < FETCH_BATCH_SIZE) {
                hasMore = false; // Last page
                logs.push('Last page of products reached.');
            } else {
                page++;
            }
        } else {
            hasMore = false; // No more data
            logs.push('No more products to fetch.');
        }
    }

    // The result is an array of objects with individual columns.
    // We need to map it to an array of ShopifyProduct objects.
    const products: ShopifyProduct[] = allProductsData.map(item => {
        return {
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
            linked_to_platforms: item.linked_to_platforms || ['shopify'],
            amazon_asin: item.amazon_asin,
            walmart_id: item.walmart_id,
        }
    });

    logs.push(`Successfully fetched a total of ${products.length} products from website database.`);

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
    
export async function getSingleWebsiteProduct(id: string): Promise<ShopifyProduct | null> {
    const supabase = createSupabaseServerClient('DATA');
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error || !data) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }

    return {
        id: data.shopify_product_id,
        admin_graphql_api_id: data.id,
        handle: data.handle,
        title: data.title,
        body_html: data.body_html,
        vendor: data.vendor,
        product_type: data.product_type,
        status: data.status,
        tags: data.tags,
        created_at: data.created_at,
        updated_at: data.updated_at,
        published_at: data.published_at,
        variants: data.variants,
        options: data.options,
        images: data.images,
        image: data.image,
        template_suffix: '',
        published_scope: 'web', 
    };
}

export async function updateProductMarketplaceId(productId: string, marketplace: 'amazon' | 'walmart' | string, marketplaceId: string) {
    const supabase = createSupabaseServerClient('DATA');
    const updateData: { [key: string]: any } = {
        last_synced: new Date().toISOString()
    };
    
    const idColumn = `${marketplace}_id`;
    if (marketplace === 'amazon') {
      updateData.amazon_asin = marketplaceId;
    } else if (marketplace === 'walmart') {
      updateData.walmart_id = marketplaceId;
    } else {
      updateData[idColumn] = marketplaceId;
    }

    // Add the marketplace to the linked_to_platforms array
    const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('linked_to_platforms')
        .eq('id', productId)
        .single();

    if (fetchError) {
        console.error(`Error fetching product to update linked platforms: ${fetchError.message}`);
        // Continue anyway, just won't update the array
    }

    const currentPlatforms = currentProduct?.linked_to_platforms || [];
    if (!currentPlatforms.includes(marketplace)) {
        updateData.linked_to_platforms = [...currentPlatforms, marketplace];
    }

    const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId);

    if (error) {
        console.error(`Error updating product ${productId} with ${marketplace} ID:`, error);
        throw new Error(`Failed to update database for ${marketplace}: ${error.message}`);
    } else {
        console.log(`Successfully linked product ${productId} to ${marketplace} with ID ${marketplaceId}`);
    }
}
    
