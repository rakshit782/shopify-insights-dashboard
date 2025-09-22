
import type { ShopifyProduct } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { createClient } from '@supabase/supabase-js';

interface ShopifyAdminProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  variants: {
    price: string;
    inventory_quantity: number;
  }[];
  image: {
    src: string;
  } | null;
}

async function getShopifyCredentialsFromSupabase(): Promise<{ storeUrl: string; accessToken: string }> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or anon key is not defined in environment variables.');
  }
  
  if (supabaseUrl.includes('YOUR_SUPABASE_URL') || supabaseKey.includes('YOUR_SUPABASE_ANON_KEY')) {
     console.warn('Using placeholder Supabase credentials. Please update your .env file.');
    return { storeUrl: '', accessToken: '' };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('shopify_credentials')
    .select('store_url, access_token')
    .limit(1)
    .single();

  if (error) {
    throw new Error(`Failed to fetch Shopify credentials from Supabase: ${error.message}`);
  }

  if (!data) {
    throw new Error('No Shopify credentials found in Supabase.');
  }

  return { storeUrl: data.store_url, accessToken: data.access_token };
}

export async function getShopifyProducts(): Promise<ShopifyProduct[]> {
  let storeUrl = process.env.SHOPIFY_STORE_URL;
  let accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  try {
    const credentials = await getShopifyCredentialsFromSupabase();
    if(credentials.storeUrl && credentials.accessToken){
      storeUrl = credentials.storeUrl;
      accessToken = credentials.accessToken;
    }
  } catch (e) {
    console.warn("Could not fetch credentials from Supabase, falling back to .env.", e)
  }
  
  if (!storeUrl || !accessToken) {
    throw new Error('Shopify store URL or access token is not defined.');
  }

  // A simple check for placeholder values
  if (storeUrl.includes('YOUR_SHOPIFY_STORE_URL') || accessToken.includes('YOUR_SHOPIFY_ACCESS_TOKEN')) {
    console.warn('Using placeholder Shopify credentials. Please update your .env file or Supabase.');
    return [];
  }

  const endpoint = `${storeUrl}/admin/api/2023-10/products.json`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure we get fresh data on every request
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to fetch Shopify products: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const { products: shopifyProducts } = await response.json() as { products: ShopifyAdminProduct[] };

    // Map the data from Shopify's API to our ShopifyProduct type
    return shopifyProducts.map((product, index) => {
      const placeholder = PlaceHolderImages[index % PlaceHolderImages.length];
      const variant = product.variants[0] || {};
      
      return {
        id: `gid://shopify/Product/${product.id}`, // Construct a GID-like string id
        title: product.title,
        description: product.body_html || 'No description available.',
        vendor: product.vendor,
        product_type: product.product_type,
        price: parseFloat(variant.price || '0'),
        inventory: variant.inventory_quantity || 0,
        imageUrl: product.image?.src || placeholder.imageUrl,
        imageHint: placeholder.imageHint,
        // Mock data for fields not present in this Shopify endpoint
        unitsSold: Math.floor(Math.random() * 2000),
        totalRevenue: Math.floor(Math.random() * 100000),
        averageRating: +(Math.random() * (5 - 3.5) + 3.5).toFixed(1),
        numberOfReviews: Math.floor(Math.random() * 500),
      };
    });
  } catch (error) {
    console.error('Error fetching from Shopify:', error);
    // Return an empty array or handle the error as appropriate for your app
    return [];
  }
}
