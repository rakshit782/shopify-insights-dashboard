
import type { ShopifyProduct } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseCredentials } from '@/app/settings/actions';

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

async function getShopifyCredentialsFromSupabase(): Promise<{ storeName: string; accessToken: string }> {
  const { supabaseUrl, supabaseKey } = await getSupabaseCredentials();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or anon key is not configured.');
  }
  
  if (supabaseUrl.includes('YOUR_SUPABASE_URL') || supabaseKey.includes('YOUR_SUPABASE_ANON_KEY')) {
    throw new Error('Please configure your Supabase credentials in the settings page.');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('shopify_credentials')
    .select('store_name, access_token')
    .limit(1)
    .single();

  if (error) {
    throw new Error(`Failed to fetch Shopify credentials from Supabase: ${error.message}. Please check your table and column names (expected 'shopify_credentials' table with 'store_name' and 'access_token' columns).`);
  }

  if (!data) {
    throw new Error('No Shopify credentials found in Supabase. Please ensure the \'shopify_credentials\' table has at least one entry.');
  }

  return { storeName: data.store_name, accessToken: data.access_token };
}

export async function getShopifyProducts(): Promise<ShopifyProduct[]> {
  let storeUrl;
  let accessToken;

  try {
    const credentials = await getShopifyCredentialsFromSupabase();
    if(credentials.storeName && credentials.accessToken){
      storeUrl = `https://${credentials.storeName}.myshopify.com`;
      accessToken = credentials.accessToken;
    } else {
       throw new Error('Invalid Shopify credentials from Supabase.');
    }
  } catch (e) {
      if (e instanceof Error) {
        // Re-throw the specific error from getShopifyCredentialsFromSupabase
        throw e;
      }
      throw new Error("An unknown error occurred while fetching credentials from Supabase.");
  }
  
  if (!storeUrl || !accessToken) {
    throw new Error('Shopify store URL or access token is not defined after fetching from Supabase.');
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
      throw new Error(`Failed to fetch Shopify products: ${response.status} ${response.statusText}. Check your Shopify store name and admin access token.`);
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
    if (error instanceof Error) {
        // Re-throw the specific error for the UI to display
        throw error;
    }
    throw new Error('An unknown error occurred while fetching products from Shopify.');
  }
}
