
import 'dotenv/config';
import type { MappedShopifyProduct, ShopifyProduct, ShopifyOrder, WebsiteProduct, ShopifyProductCreation, ShopifyProductUpdate, AmazonCredentials, WalmartCredentials, EbayCredentials, EtsyCredentials, WayfairCredentials, WalmartOrder } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

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

async function upsertCredential(supabase: any, tableName: string, data: any) {
    // This function ensures that there is only one row in the credential table.
    // It first tries to select an existing row. If found, it updates it.
    // If not found, it inserts a new one.
    const { data: existing, error: selectError } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);

    if (selectError && !selectError.message.includes('relation') && !selectError.message.includes('does not exist')) {
        // If the error is anything other than the table not existing, throw it.
        throw new Error(`Failed to check for existing credentials in ${tableName}: ${selectError.message}`);
    }

    if (existing && existing.length > 0) {
        // Row exists, so update it.
        const { error: updateError } = await supabase
            .from(tableName)
            .update(data)
            .eq('id', existing[0].id);

        if (updateError) {
            throw new Error(`Failed to update credentials in ${tableName}: ${updateError.message}`);
        }
    } else {
        // No row exists, so insert a new one.
        const { error: insertError } = await supabase
            .from(tableName)
            .insert(data);
        
        if (insertError) {
            throw new Error(`Failed to insert credentials into ${tableName}: ${insertError.message}`);
        }
    }
}


async function checkCredentialExists(supabase: any, tableName: string, logs: string[]): Promise<boolean> {
    const { data, error } = await supabase.from(tableName).select('id').limit(1);
    if (error) {
        // Don't throw an error if the table doesn't exist, just return false.
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
            logs.push(`Table ${tableName} does not exist, considering it not connected.`);
            return false;
        }
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
    await upsertCredential(supabase, 'shopify_credentials', { store_name: storeName, access_token: accessToken });
}

export async function saveAmazonCredentials(credentials: AmazonCredentials): Promise<void> {
    const logs: string[] = [];
    const supabase = await getSupabaseClient(logs);
    await upsertCredential(supabase, 'amazon_credentials', credentials);
}

export async function saveWalmartCredentials(credentials: WalmartCredentials): Promise<void> {
    const logs: string[] = [];
    const supabase = await getSupabaseClient(logs);
    await upsertCredential(supabase, 'walmart_credentials', credentials);
}

export async function saveEbayCredentials(credentials: EbayCredentials): Promise<void> {
    const logs: string[] = [];
    const supabase = await getSupabaseClient(logs);
    await upsertCredential(supabase, 'ebay_credentials', credentials);
}

export async function saveEtsyCredentials(credentials: EtsyCredentials): Promise<void> {
    const logs: string[] = [];
    const supabase = await getSupabaseClient(logs);
    await upsertCredential(supabase, 'etsy_credentials', credentials);
}

export async function saveWayfairCredentials(credentials: WayfairCredentials): Promise<void> {
    const logs: string[] = [];
    const supabase = await getSupabaseClient(logs);
    await upsertCredential(supabase, 'wayfair_credentials', credentials);
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
  return rawProducts.map((product, index) => {
    const placeholder = PlaceHolderImages[index % PlaceHolderImages.length];
    const variant = product.variants?.[0] || { price: '0', inventory_quantity: 0 };

    return {
      ...product, 
      id: product.admin_graphql_api_id,
      description: product.body_html || 'No description available.',
      price: parseFloat(variant.price || '0'),
      inventory: variant.inventory_quantity || 0,
      imageUrl: product.image?.src || placeholder.imageUrl,
      imageHint: placeholder.imageHint || product.product_type.toLowerCase().split(' ').slice(0,2).join(' '),
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

export async function getShopifyOrders(options?: { createdAtMin?: string, createdAtMax?: string }): Promise<{ orders: ShopifyOrder[], logs: string[] }> {
  const logs: string[] = [];
  const credentials = await getShopifyCredentialsFromSupabase(logs);
  const { storeName, accessToken } = credentials;
  const storeUrl = getStoreUrl(storeName);
  const headers = {
    'X-Shopify-Access-Token': accessToken,
    'Content-Type': 'application/json',
  };

  try {
    const params = new URLSearchParams({
        status: 'any',
    });
    if (options?.createdAtMin) {
        params.append('created_at_min', options.createdAtMin);
    }
    if (options?.createdAtMax) {
        params.append('created_at_max', options.createdAtMax);
    }

    let allOrders: ShopifyOrder[] = [];
    let endpoint = `${storeUrl}/admin/api/2025-01/orders.json?${params.toString()}`;
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

// ========== Walmart ==========

async function getWalmartCredentials(logs: string[]): Promise<WalmartCredentials> {
    const supabase = await getSupabaseClient(logs);
    logs.push("Fetching Walmart credentials...");
    const { data, error } = await supabase.from('walmart_credentials').select('client_id, client_secret').limit(1);

    if (error) throw new Error(`Failed to fetch Walmart credentials: ${error.message}`);
    if (!data || data.length === 0) throw new Error('No Walmart credentials found in Supabase.');

    logs.push("Successfully fetched Walmart credentials.");
    return data[0];
}

async function getWalmartAccessToken(credentials: WalmartCredentials, logs: string[]): Promise<string> {
    const authUrl = 'https://marketplace.walmartapis.com/v3/token';
    const authString = Buffer.from(`${credentials.client_id}:${credentials.client_secret}`).toString('base64');
    const correlationId = uuidv4();

    logs.push("Requesting Walmart access token...");
    const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'WM_QOS.CORRELATION_ID': correlationId,
            'WM_SVC.NAME': 'Walmart Marketplace',
            'Accept': 'application/json'
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        const errorText = await response.text();
        logs.push(`Failed to get Walmart access token: ${response.status} - ${errorText}`);
        throw new Error(`Failed to get Walmart access token: ${errorText}`);
    }

    const data = await response.json() as { access_token: string };
    logs.push("Successfully obtained Walmart access token.");
    return data.access_token;
}

export async function getWalmartOrders(options: { createdStartDate?: string, limit?: string }): Promise<{ orders: ShopifyOrder[], logs: string[] }> {
    const logs: string[] = [];
    const credentials = await getWalmartCredentials(logs);
    const accessToken = await getWalmartAccessToken(credentials, logs);
    const correlationId = uuidv4();
    const apiUrl = 'https://marketplace.walmartapis.com/v3/orders';

    const params = new URLSearchParams({
        limit: options.limit || '100',
    });

    if (options.createdStartDate) {
        params.append('createdStartDate', options.createdStartDate);
    }

    logs.push(`Fetching Walmart orders from: ${apiUrl}?${params.toString()}`);

    const response = await fetch(`${apiUrl}?${params.toString()}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'WM_QOS.CORRELATION_ID': correlationId,
            'WM_SVC.NAME': 'Walmart Marketplace',
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        logs.push(`Failed to fetch Walmart orders: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch Walmart orders: ${errorText}`);
    }

    const data = await response.json() as { list: { elements: { order: WalmartOrder[] } } };
    const rawOrders = data.list?.elements?.order || [];
    logs.push(`Successfully fetched ${rawOrders.length} Walmart orders.`);

    const mappedOrders = rawOrders.map(mapWalmartOrderToShopifyOrder);

    return { orders: mappedOrders, logs };
}

function mapWalmartOrderToShopifyOrder(walmartOrder: WalmartOrder): ShopifyOrder {
    const orderTotal = walmartOrder.orderLines.orderLine.reduce((total, line) => {
        return total + line.charges.charge.reduce((lineTotal, charge) => lineTotal + charge.chargeAmount.amount, 0);
    }, 0);

    const nameParts = walmartOrder.shippingInfo.postalAddress.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    const latestStatus = walmartOrder.orderLines.orderLine[0]?.status || 'Created';

    return {
        id: walmartOrder.purchaseOrderId,
        admin_graphql_api_id: `gid://walmart/Order/${walmartOrder.purchaseOrderId}`,
        name: walmartOrder.purchaseOrderId,
        created_at: new Date(walmartOrder.orderDate).toISOString(),
        updated_at: new Date(walmartOrder.orderDate).toISOString(),
        total_price: orderTotal.toFixed(2),
        currency: walmartOrder.orderLines.orderLine[0]?.charges.charge[0]?.chargeAmount.currency || 'USD',
        financial_status: 'paid', // Walmart API doesn't provide this, assuming paid for simplicity
        fulfillment_status: latestStatus,
        customer: {
            email: walmartOrder.customerEmailId,
            first_name: firstName,
            last_name: lastName,
        },
        shipping_address: {
            first_name: firstName,
            last_name: lastName,
            address1: walmartOrder.shippingInfo.postalAddress.address1,
            address2: walmartOrder.shippingInfo.postalAddress.address2,
            city: walmartOrder.shippingInfo.postalAddress.city,
            province: walmartOrder.shippingInfo.postalAddress.state,
            country: walmartOrder.shippingInfo.postalAddress.country,
            zip: walmartOrder.shippingInfo.postalAddress.postalCode,
            phone: walmartOrder.shippingInfo.phone,
        },
        line_items: walmartOrder.orderLines.orderLine.map(line => ({
            id: line.lineNumber,
            title: line.item.productName,
            quantity: parseInt(line.orderLineQuantity.amount, 10),
            price: line.charges.charge[0]?.chargeAmount.amount.toFixed(2) || '0.00',
            sku: line.item.sku
        })),
    };
}
