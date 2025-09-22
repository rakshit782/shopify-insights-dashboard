
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
        id: p.id,
        title: p.title,
        description: p.description,
        vendor: p.vendor,
        product_type: p.product_type,
        price: p.price,
        inventory: p.inventory,
        image_url: p.imageUrl,
        image_hint: p.imageHint,
        units_sold: p.unitsSold,
        total_revenue: p.totalRevenue,
        average_rating: p.averageRating,
        number_of_reviews: p.numberOfReviews,
    }));

    const { error } = await supabase
        .from('products')
        .upsert(productsToUpsert, { onConflict: 'id' });

    if (error) {
        throw new Error(`Failed to sync products to website: ${error.message}`);
    }
}
