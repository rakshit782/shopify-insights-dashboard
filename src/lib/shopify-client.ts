
import 'dotenv/config';
import type { MappedShopifyProduct, ShopifyProduct, WebsiteProduct, ShopifyProductCreation } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { createClient } from '@supabase/supabase-js';

// If running locally on Node <18, uncomment:
// import fetch from 'node-fetch';

interface ShopifyFetchResult {
  products: MappedShopifyProduct[];
  rawProducts: ShopifyProduct[];
  logs: string[];
}

async function getShopifyCredentialsFromSupabase(
  logs: string[]
): Promise<{ storeName: string; accessToken: string }> {
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
  const supabase = createClient(supabaseUrl, supabaseKey);

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
    throw new Error('No Shopify credentials found in Supabase.');
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

export async function getShopifyProducts(): Promise<Pick<ShopifyFetchResult, 'rawProducts' | 'logs'>> {
  const logs: string[] = [];
  let allProducts: ShopifyProduct[] = [];

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

  const storeUrl = `https://${storeName}`;
  let endpoint = `${storeUrl}/admin/api/2025-01/products.json?limit=250`;

  logs.push('Starting Shopify product fetch...');

  try {
    while (endpoint) {
      logs.push(`Calling Shopify API endpoint: ${endpoint}`);
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
        throw new Error(`Failed to fetch Shopify products: ${response.status} ${response.statusText}`);
      }

      const { products: rawProducts } = (await response.json()) as {
        products: ShopifyProduct[];
      };
      allProducts = allProducts.concat(rawProducts);
      logs.push(`Received ${rawProducts.length} raw products. Total fetched: ${allProducts.length}`);

      // Handle pagination
      const linkHeader = response.headers.get('Link');
      if (linkHeader) {
        const nextLink = linkHeader.split(',').find(s => s.includes('rel="next"'));
        if (nextLink) {
          const match = nextLink.match(/<(.*?)>/);
          endpoint = match ? match[1] : '';
        } else {
          endpoint = ''; // No more pages
        }
      } else {
        endpoint = ''; // No more pages
      }
    }

    logs.push(`Finished fetching. Total products received: ${allProducts.length}`);
    return { rawProducts: allProducts, logs };
  } catch (error) {
    if (error instanceof Error) {
      logs.push(`Fetch Error: ${error.message}`);
      throw error;
    }
    logs.push('Unknown error while fetching products from Shopify.');
    throw new Error('Unknown error while fetching products from Shopify.');
  }
}

export async function createShopifyProduct(productData: ShopifyProductCreation): Promise<{ product: ShopifyProduct }> {
  const logs: string[] = [];
  const credentials = await getShopifyCredentialsFromSupabase(logs);
  const { storeName, accessToken } = credentials;
  const storeUrl = `https://${storeName}`;
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
