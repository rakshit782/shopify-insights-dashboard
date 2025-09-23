
import 'dotenv/config';
import type {
  MappedShopifyProduct,
  ShopifyProduct,
  ShopifyOrder,
  ShopifyProductCreation,
  ShopifyProductUpdate,
  AmazonCredentials,
  WalmartCredentials,
  EbayCredentials,
  EtsyCredentials,
  WayfairCredentials,
  WalmartOrder,
  AppSettings,
  ShopifyCredentials,
} from './types';
import { PlaceHolderImages } from './placeholder-images';
import { createClient } from '@/lib/supabase/server';
import fetch, { type Response } from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import forge from 'node-forge';
import { DateRange } from 'react-day-picker';

export interface PlatformProductCount {
  platform: string;
  count: number;
}

const apiVersionDefault = '2025-07';

// ============================================
// Credential Management
// =_==========================================

async function upsertCredential(
  supabase: any,
  tableName: string,
  data: any,
) {
  const { error } = await supabase.from(tableName).upsert(data, { onConflict: 'profile_id, name' });
  if (error) {
    throw new Error(
      `Failed upserting credentials in ${tableName}: ${error.message}`
    );
  }
}

async function checkCredentialExists(
  supabase: any,
  tableName: string,
  profileId: string,
  logs: string[]
): Promise<boolean> {
  const { data, error } = await supabase.from(tableName).select('id').eq('profile_id', profileId).limit(1);
  if (error) {
    logs.push(`Error checking ${tableName}: ${error.message}`);
    return false;
  }
  return data && data.length > 0;
}

export async function getCredentialStatuses(profileId: string): Promise<Record<string, boolean>> {
  const logs: string[] = [];
  const supabase = createClient({ db: 'MAIN' });
  const statuses: Record<string, boolean> = {};

  const platforms = ['shopify', 'amazon', 'walmart', 'ebay', 'etsy', 'wayfair'];

  for (const platform of platforms) {
    const tableName = `${platform}_credentials`;
    statuses[platform] = await checkCredentialExists(supabase, tableName, profileId, logs);
  }

  return statuses;
}

// Individual save functions

export async function saveShopifyCredentials(profileId: string, storeName: string, accessToken: string) {
  const supabase = createClient({ db: 'MAIN' });
  await upsertCredential(
    supabase,
    'shopify_credentials',
    { profile_id: profileId, name: 'shopify', store_name: storeName, access_token: accessToken, api_version: apiVersionDefault },
  );
}

export async function saveAmazonCredentials(profileId: string, credentials: AmazonCredentials) {
  const supabase = createClient({ db: 'MAIN' });
  // In a real app, you would likely encrypt the client_secret and refresh_token
  const credsToSave = {
      profile_id: profileId,
      name: 'amazon',
      profile_id_amazon: credentials.profile_id,
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
      refresh_token: credentials.refresh_token,
      seller_id: credentials.seller_id,
      marketplace_id: credentials.marketplace_id,
  };
  await upsertCredential(supabase, 'amazon_credentials', credsToSave);
}

export async function saveWalmartCredentials(profileId: string, credentials: WalmartCredentials) {
  const supabase = createClient({ db: 'MAIN' });
  await upsertCredential(supabase, 'walmart_credentials', { ...credentials, profile_id: profileId, name: 'walmart'});
}

export async function saveEbayCredentials(profileId: string, credentials: EbayCredentials) {
  const supabase = createClient({ db: 'MAIN' });
  await upsertCredential(supabase, 'ebay_credentials', { ...credentials, profile_id: profileId, name: 'ebay'});
}

export async function saveEtsyCredentials(profileId: string, credentials: EtsyCredentials) {
  const supabase = createClient({ db: 'MAIN' });
  await upsertCredential(supabase, 'etsy_credentials', {keystring: credentials.keystring, client_id: 'etsy', profile_id: profileId, name: 'etsy'});
}

export async function saveWayfairCredentials(profileId: string, credentials: WayfairCredentials) {
  const supabase = createClient({ db: 'MAIN' });
  await upsertCredential(supabase, 'wayfair_credentials', { ...credentials, profile_id: profileId, name: 'wayfair' });
}


// ============================================
// Shopify Helpers
// ============================================

async function getShopifyConfig(profileId: string, logs: string[]): Promise<ShopifyCredentials> {
    const supabase = createClient({ db: 'MAIN' });
    
    logs.push("Attempting to fetch Shopify credentials from Supabase...");
    const { data, error } = await supabase
        .from('shopify_credentials')
        .select('id, store_name, access_token, api_version')
        .eq('profile_id', profileId)
        .limit(1)
        .single();

    if (error || !data) {
        logs.push(`Supabase error fetching Shopify credentials: ${error?.message || 'Not found'}`);
        throw new Error('Could not fetch Shopify credentials for this profile.');
    }
    
    const { id, store_name, access_token, api_version } = data;
    const storeUrl = getStoreUrl(store_name);
    const apiVersion = api_version || apiVersionDefault;

    logs.push(`Successfully fetched credentials. Store: ${storeUrl}, API Version: ${apiVersion}`);

    return { id, profile_id: profileId, store_name, access_token, api_version: apiVersion };
}


export function mapShopifyProducts(rawProducts: ShopifyProduct[]): MappedShopifyProduct[] {
  return rawProducts.map((product, index) => {
    const placeholder = PlaceHolderImages[index % PlaceHolderImages.length];
    const variant = product.variants?.[0] || { price: '0', inventory_quantity: 0 };

    return {
      id: product.admin_graphql_api_id,
      title: product.title,
      vendor: product.vendor,
      product_type: product.product_type,
      description: product.body_html || 'No description available.',
      price: parseFloat(variant.price || '0'),
      inventory: variant.inventory_quantity || 0,
      imageUrl: product.image?.src || placeholder.imageUrl,
      imageHint:
        placeholder.imageHint ||
        (product.product_type ? product.product_type.toLowerCase().split(' ').slice(0, 2).join(' ') : ''),
    };
  });
}

function getStoreUrl(storeIdentifier: string): string {
  return storeIdentifier.includes('.')
    ? `https://${storeIdentifier}`
    : `https://${storeIdentifier}.myshopify.com`;
}

// Simple retry wrapper for 429
async function safeFetch(url: string, options: any, logs: string[], retries = 3): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, options);
    if (res.status !== 429) return res;
    const retryAfter = parseInt(res.headers.get('Retry-After') || '2', 10);
    logs.push(`Rate limited. Retrying in ${retryAfter}s...`);
    await new Promise(r => setTimeout(r, retryAfter * 1000));
  }
  throw new Error(`Exceeded retry attempts for ${url}`);
}

export async function getShopifyProducts(options: { profileId: string, countOnly?: boolean }): Promise<{ rawProducts: ShopifyProduct[], count?: number, logs: string[] }> {
    const logs: string[] = [];
    try {
        const config = await getShopifyConfig(options.profileId, logs);
        const storeUrl = getStoreUrl(config.store_name);
        const endpoint = options.countOnly ? 'products/count.json' : 'products.json?limit=250';
        const url = `${storeUrl}/admin/api/${config.api_version}/${endpoint}`;
        
        logs.push(`Fetching Shopify data from endpoint: ${endpoint}`);
        const response = await safeFetch(url, {
            headers: { 'X-Shopify-Access-Token': config.access_token }
        }, logs);

        if (!response.ok) {
            const errorBody = await response.text();
            logs.push(`Shopify API Error: ${response.status} ${response.statusText} - ${errorBody}`);
            throw new Error(`Failed to fetch from Shopify: ${response.statusText}`);
        }

        const data: any = await response.json();

        if (options.countOnly) {
            logs.push(`Successfully fetched product count: ${data.count}`);
            return { rawProducts: [], count: data.count, logs };
        }
        
        logs.push(`Successfully fetched ${data.products.length} products.`);
        return { rawProducts: data.products, logs };

    } catch (error) {
        if (error instanceof Error) {
            logs.push(`Error in getShopifyProducts: ${error.message}`);
        } else {
            logs.push(`An unknown error occurred in getShopifyProducts.`);
        }
        // Re-throw the error to be caught by the API route/server action
        throw error;
    }
}


export async function createShopifyProduct(profileId: string, productData: ShopifyProductCreation): Promise<{ product: ShopifyProduct, logs: string[] }> {
    const logs: string[] = [];
    try {
        const config = await getShopifyConfig(profileId, logs);
        const storeUrl = getStoreUrl(config.store_name);
        const url = `${storeUrl}/admin/api/${config.api_version}/products.json`;

        const body = JSON.stringify({
            product: {
                title: productData.title,
                body_html: productData.body_html,
                vendor: productData.vendor,
                product_type: productData.product_type,
                published: true, // Make it published by default
                variants: [
                    {
                        price: productData.price,
                        inventory_management: 'shopify',
                        inventory_quantity: 0
                    }
                ]
            }
        });

        logs.push('Creating product with body:', body);

        const response = await safeFetch(url, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': config.access_token,
                'Content-Type': 'application/json'
            },
            body: body
        }, logs);

        if (!response.ok) {
            const errorBody = await response.json();
            logs.push(`Shopify API Error on create: ${response.status} - ${JSON.stringify(errorBody)}`);
            throw new Error(`Failed to create Shopify product: ${errorBody.errors?.product || JSON.stringify(errorBody.errors)}`);
        }

        const data: { product: ShopifyProduct } = await response.json() as any;
        logs.push(`Successfully created product ${data.product.id}`);
        return { product: data.product, logs };

    } catch (error) {
        if (error instanceof Error) {
            logs.push(`Error in createShopifyProduct: ${error.message}`);
        }
        throw error;
    }
}

export async function updateShopifyProduct(profileId: string, productData: ShopifyProductUpdate): Promise<{ product: ShopifyProduct, logs: string[] }> {
    const logs: string[] = [];
    try {
        const config = await getShopifyConfig(profileId, logs);
        const storeUrl = getStoreUrl(config.store_name);
        const url = `${storeUrl}/admin/api/${config.api_version}/products/${productData.id}.json`;

        const body = JSON.stringify({ product: productData });
        
        logs.push(`Updating product ${productData.id} with body:`, body);

        const response = await safeFetch(url, {
            method: 'PUT',
            headers: {
                'X-Shopify-Access-Token': config.access_token,
                'Content-Type': 'application/json'
            },
            body: body
        }, logs);
        
        if (!response.ok) {
            const errorBody = await response.json();
            logs.push(`Shopify API Error on update: ${response.status} - ${JSON.stringify(errorBody)}`);
            throw new Error(`Failed to update Shopify product: ${errorBody.errors?.product || JSON.stringify(errorBody.errors)}`);
        }
        
        const data: { product: ShopifyProduct } = await response.json() as any;
        logs.push(`Successfully updated product ${data.product.id}`);
        return { product: data.product, logs };

    } catch (error) {
         if (error instanceof Error) {
            logs.push(`Error in updateShopifyProduct: ${error.message}`);
        }
        throw error;
    }
}

export async function getShopifyProduct(profileId: string, id: number): Promise<{ product: ShopifyProduct | null, logs: string[] }> {
    const logs: string[] = [];
    try {
        const config = await getShopifyConfig(profileId, logs);
        const storeUrl = getStoreUrl(config.store_name);
        const url = `${storeUrl}/admin/api/${config.api_version}/products/${id}.json`;
        
        logs.push(`Fetching product with ID: ${id}`);
        const response = await safeFetch(url, {
            headers: { 'X-Shopify-Access-Token': config.access_token }
        }, logs);

        if (!response.ok) {
             if (response.status === 404) {
                logs.push(`Product with ID ${id} not found.`);
                return { product: null, logs };
            }
            const errorBody = await response.text();
            logs.push(`Shopify API Error: ${response.status} ${response.statusText} - ${errorBody}`);
            throw new Error(`Failed to fetch product from Shopify: ${response.statusText}`);
        }

        const data: { product: ShopifyProduct } = await response.json() as any;
        logs.push(`Successfully fetched product ${data.product.id}`);
        return { product: data.product, logs };

    } catch (error) {
        if (error instanceof Error) {
            logs.push(`Error in getShopifyProduct: ${error.message}`);
        }
        throw error;
    }
}

export async function getShopifyOrders(options: { profileId: string, dateRange?: DateRange }): Promise<{ orders: ShopifyOrder[]; logs: string[] }> {
  const logs: string[] = [];
  try {
    const config = await getShopifyConfig(options.profileId, logs);
    const storeUrl = getStoreUrl(config.store_name);
    
    const params = new URLSearchParams({
        status: 'any',
        limit: '250',
    });

    if (options.dateRange?.from) {
        params.append('created_at_min', options.dateRange.from.toISOString());
    }
    if (options.dateRange?.to) {
        params.append('created_at_max', options.dateRange.to.toISOString());
    }

    const url = `${storeUrl}/admin/api/${config.api_version}/orders.json?${params.toString()}`;

    logs.push(`Fetching Shopify orders from ${url}`);
    const response = await safeFetch(url, {
      headers: { 'X-Shopify-Access-Token': config.access_token },
    }, logs);

    if (!response.ok) {
      const errorBody = await response.text();
      logs.push(`Shopify API Error fetching orders: ${response.status} - ${errorBody}`);
      throw new Error(`Failed to fetch Shopify orders: ${response.statusText}`);
    }

    const data: { orders: ShopifyOrder[] } = await response.json() as any;
    logs.push(`Successfully fetched ${data.orders.length} orders from Shopify.`);
    return { orders: data.orders, logs };
  } catch (error) {
    if (error instanceof Error) {
      logs.push(`Error in getShopifyOrders: ${error.message}`);
    }
    throw error;
  }
}


// ============================================
// External Platform Functions
// ============================================
export async function getPlatformProductCounts(profileId: string, logs: string[]): Promise<PlatformProductCount[]> {
    const supabase = createClient({ db: 'MAIN' });
    const counts: PlatformProductCount[] = [];

    // Mocking counts for now
    const platforms = ['Shopify', 'Amazon', 'Walmart', 'eBay', 'Etsy'];
    for (const platform of platforms) {
        const tableName = `${platform.toLowerCase()}_credentials`;
        const connected = await checkCredentialExists(supabase, tableName, profileId, logs);
        if (connected) {
            logs.push(`Fetching count for connected platform: ${platform}`);
            // In a real scenario, you'd make an API call to the platform
            // For now, we return a mock count if connected.
            if (platform === 'Shopify') {
                 const { count } = await getShopifyProducts({ profileId, countOnly: true });
                 counts.push({ platform, count: count || 0 });
            } else {
                counts.push({ platform, count: Math.floor(Math.random() * 5000) });
            }
        }
    }
    return counts;
}

// ============================================
// Walmart Helpers
// ============================================

async function getWalmartConfig(profileId: string, logs: string[]): Promise<{ clientId: string; clientSecret: string; }> {
    const supabase = createClient({ db: 'MAIN' });
    
    logs.push("Attempting to fetch Walmart credentials from Supabase...");
    const { data, error } = await supabase
        .from('walmart_credentials')
        .select('client_id, client_secret')
        .eq('profile_id', profileId)
        .limit(1)
        .single();

    if (error || !data) {
        logs.push(`Supabase error fetching Walmart credentials: ${error?.message || 'Not found'}`);
        throw new Error('Could not fetch Walmart credentials for this profile.');
    }
    
    const { client_id, client_secret } = data;
    logs.push(`Successfully fetched Walmart credentials.`);

    return { clientId: client_id, clientSecret: client_secret };
}


async function getWalmartAccessToken(clientId: string, clientSecret: string, logs: string[]): Promise<string> {
    const url = 'https://marketplace.walmartapis.com/v3/token';
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const correlationId = uuidv4();

    logs.push('Requesting Walmart access token...');
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'WM_QOS.CORRELATION_ID': correlationId,
            'WM_SVC.NAME': 'Walmart-Marketplace-Api'
        },
        body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        const errorBody = await response.text();
        logs.push(`Walmart Token API Error: ${response.status} - ${errorBody}`);
        throw new Error('Failed to get Walmart access token.');
    }

    const data: any = await response.json();
    logs.push('Successfully retrieved Walmart access token.');
    return data.access_token;
}


export async function getWalmartOrders(profileId: string): Promise<{ orders: ShopifyOrder[]; logs: string[] }> {
  const logs: string[] = [];
  try {
    const { clientId, clientSecret } = await getWalmartConfig(profileId, logs);
    const accessToken = await getWalmartAccessToken(clientId, clientSecret, logs);
    
    const correlationId = uuidv4();
    // Get orders created in the last 7 days as an example
    const createdStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const url = `https://marketplace.walmartapis.com/v3/orders?createdStartDate=${createdStartDate}`;

    logs.push('Fetching Walmart orders...');
    const response = await fetch(url, {
      headers: {
        'WM_SEC.ACCESS_TOKEN': accessToken,
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'WM_QOS.CORRELATION_ID': correlationId,
        'WM_SVC.NAME': 'Walmart-Marketplace-Api',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logs.push(`Walmart Orders API Error: ${response.status} - ${errorBody}`);
      throw new Error(`Failed to fetch Walmart orders.`);
    }

    const data: { list?: { elements?: { order: WalmartOrder[] } } } = await response.json() as any;
    const walmartOrders = data.list?.elements?.order || [];
    logs.push(`Successfully fetched ${walmartOrders.length} orders from Walmart.`);

    const mappedOrders = walmartOrders.map(mapWalmartOrderToShopifyOrder);

    return { orders: mappedOrders, logs };

  } catch (error) {
    if (error instanceof Error) {
      logs.push(`Error in getWalmartOrders: ${error.message}`);
    }
    throw error;
  }
}


function getWalmartSignature(
  consumerId: string,
  privateKey: string,
  requestUrl: string,
  requestMethod: string,
  timestamp: string
): string {
  const stringToSign = `${consumerId}\n${requestUrl}\n${requestMethod.toUpperCase()}\n${timestamp}\n`;
  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

  try {
      const pkiKey = forge.pki.privateKeyFromPem(formattedPrivateKey);
      const md = forge.md.sha256.create();
      md.update(stringToSign, 'utf8');
      const signature = pkiKey.sign(md);
      return forge.util.encode64(signature);
  } catch (e) {
      throw new Error("Failed to parse private key. Ensure it is a valid PKCS8 key.");
  }
}

function mapWalmartOrderToShopifyOrder(walmartOrder: WalmartOrder): ShopifyOrder {
  const orderTotal = walmartOrder.orderLines.orderLine.reduce((total, line) => {
    return (
      total +
      line.charges.charge.reduce((lineTotal, charge) => {
        return lineTotal + Number(charge.chargeAmount?.amount || 0);
      }, 0)
    );
  }, 0);

  const nameParts = walmartOrder.shippingInfo.postalAddress.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  const latestStatus = walmartOrder.orderLines.orderLine[0]?.status || 'Created';

  return {
    id: walmartOrder.purchaseOrderId,
    admin_graphql_api_id: `gid://walmart/Order/${walmartOrder.purchaseOrderId}`,
    name: walmartOrder.purchaseOrderId,
    created_at: new Date(walmartOrder.orderDate).toISOString(),
    updated_at: new Date(walmartOrder.orderDate).toISOString(),
    total_price: orderTotal.toFixed(2),
    currency:
      walmartOrder.orderLines.orderLine[0]?.charges.charge[0]?.chargeAmount.currency ||
      'USD',
    financial_status: latestStatus === 'Created' ? 'pending' : 'paid',
    fulfillment_status: latestStatus,
    customer: {
      id: walmartOrder.customerOrderId,
      email: walmartOrder.customerEmailId,
      first_name: firstName,
      last_name: lastName,
      phone: walmartOrder.shippingInfo.phone,
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
      country_code: walmartOrder.shippingInfo.postalAddress.country,
    },
    line_items: walmartOrder.orderLines.orderLine.map(line => ({
      id: line.lineNumber,
      title: line.item.productName,
      quantity: line.orderLineQuantity
        ? parseInt(line.orderLineQuantity.amount, 10)
        : 0,
      price: Number(line.charges.charge[0]?.chargeAmount.amount || 0).toFixed(2),
      sku: line.item.sku,
      vendor: 'Walmart',
    })),
    processed_at: new Date(walmartOrder.orderDate).toISOString(),
    subtotal_price: null,
    total_tax: null,
  };
}

    