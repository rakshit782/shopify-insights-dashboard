
import 'dotenv/config';
import type { MappedShopifyProduct, ShopifyProduct, ShopifyOrder, WebsiteProduct, ShopifyProductCreation, ShopifyProductUpdate, AmazonCredentials, WalmartCredentials, EbayCredentials, EtsyCredentials, WayfairCredentials } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

interface ShopifyFetchResult {
  products: MappedShopifyProduct[];
  rawProducts: ShopifyProduct[];
  logs: string[];
}

export interface PlatformProductCount {
    platform: string;
    count: number;
}

async function getSupabaseClient(logs: string[]): Promise<any> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
        logs.push('Supabase URL is not configured. Please set SUPABASE_URL.');
        throw new Error('Missing SUPABASE_URL in environment variables.');
    }
    if (!supabaseKey) {
        logs.push('Supabase key is not configured. Please set SUPABASE_SERVICE_ROLE_KEY.');
        throw new Error('Missing Supabase key in environment variables.');
    }

    logs.push('Creating Supabase client...');
    return createClient(supabaseUrl, supabaseKey);
}

// ========== Credential Management ==========

async function checkCredentialExists(supabase: any, tableName: string, logs: string[]): Promise<boolean> {
    const { data, error } = await supabase.from(tableName).select('id').limit(1);
    if (error) {
        logs.push(`Error checking ${tableName}: ${error.message}`);
        return false;
    }
    return data && data.length > 0;
}

export async function getCredentialStatuses(): Promise<Record<string, boolean>> {
    const logs: string[] = [];
    const supabase = await getSupabaseClient(logs);
    const statuses: Record<string, boolean> = {};

    const platforms = ['shopify', 'amazon', 'walmart', 'ebay', 'etsy', 'wayfair'];

    for (const platform of platforms) {
        const tableName = `${platform}_credentials`;
        statuses[platform] = await checkCredentialExists(supabase, tableName, logs);
    }
    
    return statuses;
}

export async function saveShopifyCredentials(storeName: string, accessToken: string): Promise<void> {
    const logs: string[] = [];
    const supabase = await getSupabaseClient(logs);

    const credentials = { store_name: storeName, access_token: accessToken };
    
    // Upsert logic: check if any row exists. If so, update it. If not, insert.
    const { data: existing, error: selectError } = await supabase.from('shopify_credentials').select('id').limit(1);
    if(selectError) throw new Error(`Failed to check for existing Shopify credentials: ${selectError.message}`);
    
    if (existing && existing.length > 0) {
        const { error: updateError } = await supabase
            .from('shopify_credentials')
            .update(credentials)
            .eq('id', existing[0].id);
        if (updateError) throw new Error(`Failed to update Shopify credentials: ${updateError.message}`);
    } else {
        const { error: insertError } = await supabase
            .from('shopify_credentials')
            .insert(credentials);
        if (insertError) throw new Error(`Failed to insert Shopify credentials: ${insertError.message}`);
    }
}

export async function saveAmazonCredentials(credentials: AmazonCredentials): Promise<void> {
    const logs: string[] = [];
    const supabase = await getSupabaseClient(logs);
    const { error } = await supabase
        .from('amazon_credentials')
        .upsert(credentials, { onConflict: 'profile_id' });

    if (error) throw new Error(`Failed to save Amazon credentials: ${error.message}`);
}

export async function saveWalmartCredentials(credentials: WalmartCredentials): Promise<void> {
    const logs: string[] = [];
    const supabase = await getSupabaseClient(logs);
    const { error } = await supabase
        .from('walmart_credentials')
        .upsert(credentials, { onConflict: 'client_id' });

    if (error) throw new Error(`Failed to save Walmart credentials: ${error.message}`);
}

export async function saveEbayCredentials(credentials: EbayCredentials): Promise<void> {
    const logs: string[] = [];
    const supabase = await getSupabaseClient(logs);
    const { error } = await supabase
        .from('ebay_credentials')
        .upsert(credentials, { onConflict: 'app_id' });

    if (error) throw new Error(`Failed to save eBay credentials: ${error.message}`);
}

export async function saveEtsyCredentials(credentials: EtsyCredentials): Promise<void> {
    const logs: string[] = [];
    const supabase = await getSupabaseClient(logs);
    const { error } = await supabase
        .from('etsy_credentials')
        .upsert(credentials, { onConflict: 'keystring' });

    if (error) throw new Error(`Failed to save Etsy credentials: ${error.message}`);
}

export async function saveWayfairCredentials(credentials: WayfairCredentials): Promise<void> {
    const logs: string[] = [];
    const supabase = await getSupabaseClient(logs);
    const { error } = await supabase
        .from('wayfair_credentials')
        .upsert(credentials, { onConflict: 'client_id' });

    if (error) throw new Error(`Failed to save Wayfair credentials: ${error.message}`);
}



export async function getPlatformProductCounts(logs: string[]): Promise<PlatformProductCount[]> {
    const supabase = await getSupabaseClient(logs);
    
    logs.push("Fetching external platform product counts from 'platform_product_counts' table...");
    const { data, error } = await supabase
        .from('platform_product_counts')
        .select('platform, count');

    if (error) {
        logs.push(`Supabase error fetching platform counts: ${error.message}`);
        // Don't throw, just return empty array so other analytics can load
        return [];
    }
    
    logs.push(`Successfully fetched ${data.length} platform counts.`);
    return data;
}


async function getShopifyCredentialsFromSupabase(
  logs: string[]
): Promise<{ storeName: string; accessToken: string }> {
  const supabase = await getSupabaseClient(logs);

  logs.push("Fetching Shopify credentials from 'shopify_credentials' table...");
  const { data, error } = await supabase
    .from('shopify_credentials')
    .select('store_name, access_token')
    .limit(1);

  if (error) {
    logs.push(`Supabase error: ${error.message}`);
    throw new Error(`Failed to fetch Shopify credentials: ${error.message}`);
  }

  if (!data || data.length === 0) {
    logs.push('No credentials found in Supabase.');
    throw new Error('No Shopify credentials found in Supabase. Please add them on the Connections page.');
  }

  const credentials = data[0];
  logs.push('Successfully fetched Shopify credentials from Supabase.');
  return { storeName: credentials.store_name, accessToken: credentials.access_token };
}

export function mapShopifyProducts(rawProducts: ShopifyProduct[]): MappedShopifyProduct[] {
  const staticMetrics = [
    { unitsSold: 1502, totalRevenue: 120144, averageRating: 4.8, numberOfReviews: 312 },
    { unitsSold: 421, totalRevenue: 147139, averageRating: 4.6, numberOfReviews: 129 },
    { unitsSold: 2340, totalRevenue: 699660, averageRating: 4.9, numberOfReviews: 1805 },
    { unitsSold: 855, totalRevenue: 111107, averageRating: 4.5, numberOfReviews: 240 },
    { unitsSold: 5430, totalRevenue: 135695, averageRating: 4.7, numberOfReviews: 890 },
    { unitsSold: 1120, totalRevenue: 111988, averageRating: 4.6, numberOfReviews: 455 },
    { unitsSold: 3105, totalRevenue: 108519, averageRating: 4.9, numberOfReviews: 1023 },
    { unitsSold: 980, totalRevenue: 87220, averageRating: 4.8, numberOfReviews: 350 },
  ];

  return rawProducts.map((product, index) => {
    const placeholder = PlaceHolderImages[index % PlaceHolderImages.length];
    const variant = product.variants?.[0] || { price: '0', inventory_quantity: 0 };
    const metricData = staticMetrics[index % staticMetrics.length];

    return {
      // Start with all raw data for flexibility, though we primarily use the mapped fields below
      ...product, 
      id: product.admin_graphql_api_id,
      description: product.body_html || 'No description available.',
      price: parseFloat(variant.price || '0'),
      inventory: variant.inventory_quantity || 0,
      imageUrl: product.image?.src || placeholder.imageUrl,
      imageHint: placeholder.imageHint || product.product_type.toLowerCase().split(' ').slice(0,2).join(' '),
      ...metricData,
    };
  });
}

function getStoreUrl(storeIdentifier: string): string {
    if (storeIdentifier.includes('.')) {
        return `https://${storeIdentifier}`;
    }
    return `https://${storeIdentifier}.myshopify.com`;
}

export async function getShopifyProducts(options?: { countOnly?: boolean }): Promise<{ rawProducts?: ShopifyProduct[], logs: string[], count?: number }> {
  const logs: string[] = [];
  let storeName: string;
  let accessToken: string;

  try {
    const credentials = await getShopifyCredentialsFromSupabase(logs);
    storeName = credentials.storeName;
    accessToken = credentials.accessToken;
  } catch (e) {
    if (e instanceof Error) {
      logs.push(`Error fetching credentials: ${e.message}`);
      throw e;
    }
    logs.push('Unknown error while fetching credentials.');
    throw new Error('Unknown error while fetching credentials.');
  }

  const storeUrl = getStoreUrl(storeName);
  const headers = {
    'X-Shopify-Access-Token': accessToken,
    'Content-Type': 'application/json',
  };

  try {
    if (options?.countOnly) {
      const endpoint = `${storeUrl}/admin/api/2025-01/products/count.json`;
      logs.push(`Calling Shopify products count API endpoint: ${endpoint}`);
      const response = await fetch(endpoint, { headers, cache: 'no-store' });
       if (!response.ok) {
        const errorData = await response.text();
        logs.push(`Shopify API Error: ${response.status} ${response.statusText}. Details: ${errorData}`);
        throw new Error(`Failed to fetch Shopify products count: ${response.status} ${response.statusText}`);
      }
      const { count } = await response.json() as { count: number };
      logs.push(`Successfully fetched products count: ${count}`);
      return { count, logs };
    }
    
    let allProducts: ShopifyProduct[] = [];
    let endpoint = `${storeUrl}/admin/api/2025-01/products.json?limit=250`;
    logs.push('Starting Shopify product fetch...');

    while (endpoint) {
      logs.push(`Calling Shopify API endpoint: ${endpoint}`);
      const response = await fetch(endpoint, { headers, cache: 'no-store' });

      if (!response.ok) {
        const errorData = await response.text();
        logs.push(`Shopify API Error: ${response.status} ${response.statusText}. Details: ${errorData}`);
        throw new Error(`Failed to fetch Shopify products: ${response.status} ${response.statusText}`);
      }

      const { products: rawProducts } = (await response.json()) as { products: ShopifyProduct[] };
      allProducts = allProducts.concat(rawProducts);
      logs.push(`Received ${rawProducts.length} raw products. Total fetched: ${allProducts.length}`);

      const linkHeader = response.headers.get('Link');
      if (linkHeader) {
        const nextLink = linkHeader.split(',').find(s => s.includes('rel="next"'));
        endpoint = nextLink ? nextLink.match(/<(.*?)>/)?.[1] || '' : '';
      } else {
        endpoint = '';
      }
    }

    logs.push(`Finished fetching. Total products received: ${allProducts.length}`);
    return { rawProducts: allProducts, logs };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logs.push(`Fetch Error: ${errorMessage}`);
    throw new Error(`An error occurred while fetching from Shopify: ${errorMessage}`);
  }
}

export async function createShopifyProduct(productData: ShopifyProductCreation): Promise<{ product: ShopifyProduct }> {
  const logs: string[] = [];
  const credentials = await getShopifyCredentialsFromSupabase(logs);
  const { storeName, accessToken } = credentials;
  const storeUrl = getStoreUrl(storeName);
  const endpoint = `${storeUrl}/admin/api/2025-01/products.json`;

  const payload = {
    product: {
      ...productData,
      status: 'active',
      variants: [{
        price: productData.price,
        inventory_quantity: 0
      }]
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Shopify API Error:', errorData);
    throw new Error(`Failed to create Shopify product: ${JSON.stringify(errorData.errors)}`);
  }

  const { product } = await response.json();
  return { product };
}

export async function getShopifyProduct(id: number): Promise<{ product: ShopifyProduct | null }> {
  const logs: string[] = [];
  const credentials = await getShopifyCredentialsFromSupabase(logs);
  const { storeName, accessToken } = credentials;
  const storeUrl = getStoreUrl(storeName);
  const endpoint = `${storeUrl}/admin/api/2025-01/products/${id}.json`;

  const response = await fetch(endpoint, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    // If the product is not found, Shopify returns a 404
    if (response.status === 404) {
      return { product: null };
    }
    const errorData = await response.json();
    console.error('Shopify API Error:', errorData);
    throw new Error(`Failed to fetch product ${id}: ${JSON.stringify(errorData.errors)}`);
  }

  const { product } = await response.json();
  return { product };
}

export async function updateShopifyProduct(productData: ShopifyProductUpdate): Promise<{ product: ShopifyProduct }> {
  const logs: string[] = [];
  const credentials = await getShopifyCredentialsFromSupabase(logs);
  const { storeName, accessToken } = credentials;
  const storeUrl = getStoreUrl(storeName);
  const endpoint = `${storeUrl}/admin/api/2025-01/products/${productData.id}.json`;

  const payload = {
    product: productData,
  };

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Shopify API Error:', errorData);
    throw new Error(`Failed to update Shopify product: ${JSON.stringify(errorData.errors)}`);
  }

  const { product } = await response.json();
  return { product };
}

export async function getShopifyOrders(): Promise<{ orders: ShopifyOrder[], logs: string[] }> {
  const logs: string[] = [];
  const credentials = await getShopifyCredentialsFromSupabase(logs);
  const { storeName, accessToken } = credentials;
  const storeUrl = getStoreUrl(storeName);
  const headers = {
    'X-Shopify-Access-Token': accessToken,
    'Content-Type': 'application/json',
  };

  try {
    let allOrders: ShopifyOrder[] = [];
    let endpoint = `${storeUrl}/admin/api/2025-01/orders.json?status=any&limit=250`;
    logs.push('Starting Shopify order fetch...');

    while (endpoint) {
      logs.push(`Calling Shopify API endpoint: ${endpoint}`);
      const response = await fetch(endpoint, { headers, cache: 'no-store' });

      if (!response.ok) {
        const errorData = await response.text();
        logs.push(`Shopify API Error: ${response.status} ${response.statusText}. Details: ${errorData}`);
        throw new Error(`Failed to fetch Shopify orders: ${response.status} ${response.statusText}`);
      }

      const { orders } = (await response.json()) as { orders: ShopifyOrder[] };
      allOrders = allOrders.concat(orders);
      logs.push(`Received ${orders.length} orders. Total fetched: ${allOrders.length}`);

      const linkHeader = response.headers.get('Link');
      if (linkHeader) {
        const nextLink = linkHeader.split(',').find(s => s.includes('rel="next"'));
        endpoint = nextLink ? nextLink.match(/<(.*?)>/)?.[1] || '' : '';
      } else {
        endpoint = '';
      }
    }

    logs.push(`Finished fetching. Total orders received: ${allOrders.length}`);
    return { orders: allOrders, logs };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logs.push(`Fetch Error: ${errorMessage}`);
    throw new Error(`An error occurred while fetching orders from Shopify: ${errorMessage}`);
  }
}
