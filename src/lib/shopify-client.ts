
import 'dotenv/config';
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

interface ShopifyFetchResult {
  products: ShopifyProduct[];
  logs: string[];
}

async function getShopifyCredentialsFromSupabase(logs: string[]): Promise<{ storeName: string; accessToken: string }> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE_URL')) {
    logs.push('Supabase URL is not configured. Please set the SUPABASE_URL environment variable in your .env file.');
    throw new Error('The SUPABASE_URL environment variable is not configured.');
  }
   if (!supabaseKey || supabaseKey.includes('YOUR_SUPABASE_ANON_KEY')) {
    logs.push('Supabase key is not configured. Please set the SUPABASE_KEY environment variable in your .env file.');
    throw new Error('The SUPABASE_KEY environment variable is not configured.');
  }

  logs.push('Creating Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseKey);

  logs.push("Fetching Shopify credentials from 'shopify_credentials' table...");
  const { data, error } = await supabase
    .from('shopify_credentials')
    .select('store_name, access_token')
    .limit(1);

  if (error) {
    logs.push(`Supabase error: ${error.message}`);
    throw new Error(`Failed to fetch Shopify credentials from Supabase: ${error.message}. Please check your table and column names (expected 'shopify_credentials' table with 'store_name' and 'access_token' columns).`);
  }

  if (!data || data.length === 0) {
    logs.push('No credentials returned from Supabase.');
    throw new Error('No Shopify credentials found in Supabase. Please ensure the \'shopify_credentials\' table has at least one entry.');
  }
  
  const credentials = data[0];
  logs.push('Successfully fetched Shopify credentials from Supabase.');
  return { storeName: credentials.store_name, accessToken: credentials.access_token };
}

export async function getShopifyProducts(): Promise<ShopifyFetchResult> {
  const logs: string[] = [];
  let storeName;
  let accessToken;

  try {
    const credentials = await getShopifyCredentialsFromSupabase(logs);
    if(credentials.storeName && credentials.accessToken){
      storeName = credentials.storeName;
      accessToken = credentials.accessToken;
    } else {
       logs.push('Invalid Shopify credentials from Supabase (storeName or accessToken is missing).');
       throw new Error('Invalid Shopify credentials from Supabase.');
    }
  } catch (e) {
      if (e instanceof Error) {
        throw e; // Re-throw the specific error, logs are already added
      }
      logs.push('An unknown error occurred while fetching credentials from Supabase.');
      throw new Error("An unknown error occurred while fetching credentials from Supabase.");
  }
  
  if (!storeName || !accessToken) {
    logs.push('Shopify store name or access token is not defined after fetching from Supabase.');
    throw new Error('Shopify store name or access token is not defined after fetching from Supabase.');
  }

  const storeUrl = `https://${storeName}`;
  logs.push(`Constructed Shopify Store URL: ${storeUrl}`);

  const endpoint = `${storeUrl}/admin/api/2025-01/products.json`;
  logs.push(`Calling Shopify API endpoint: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.text();
      logs.push(`Shopify API Error: ${response.status} ${response.statusText}. Details: ${errorData}`);
      throw new Error(`Failed to fetch Shopify products: ${response.status} ${response.statusText}. Check your Shopify store name and admin access token.`);
    }

    logs.push('Successfully received response from Shopify API.');
    const { products: shopifyProducts } = await response.json() as { products: ShopifyAdminProduct[] };
    logs.push(`Processing ${shopifyProducts.length} products from Shopify.`);

    // Map the data from Shopify's API to our ShopifyProduct type
    const products = shopifyProducts.map((product, index) => {
      const placeholder = PlaceHolderImages[index % PlaceHolderImages.length];
      const variant = product.variants[0] || {};
      
      return {
        id: `gid://shopify/Product/${product.id}`,
        title: product.title,
        description: product.body_html || 'No description available.',
        vendor: product.vendor,
        product_type: product.product_type,
        price: parseFloat(variant.price || '0'),
        inventory: variant.inventory_quantity || 0,
        imageUrl: product.image?.src || placeholder.imageUrl,
        imageHint: placeholder.imageHint,
        unitsSold: Math.floor(Math.random() * 2000),
        totalRevenue: Math.floor(Math.random() * 100000),
        averageRating: +(Math.random() * (5 - 3.5) + 3.5).toFixed(1),
        numberOfReviews: Math.floor(Math.random() * 500),
      };
    });
    return { products, logs };
  } catch (error) {
    if (error instanceof Error) {
        logs.push(`Fetch Error: ${error.message}`);
        throw error;
    }
    logs.push('An unknown error occurred while fetching products from Shopify.');
    throw new Error('An unknown error occurred while fetching products from Shopify.');
  }
}
