
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
} from './types';
import { PlaceHolderImages } from './placeholder-images';
import { createClient } from '@supabase/supabase-js';
import fetch, { type Response } from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import forge from 'node-forge';

export interface PlatformProductCount {
  platform: string;
  count: number;
}

const apiVerson = '2025-07';

// ============================================
// Supabase Client
// ============================================

async function getSupabaseClient(logs: string[]): Promise<any> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) throw new Error('Missing SUPABASE_URL in environment variables.');
  if (!supabaseKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in environment variables.');

  logs.push('Creating Supabase client...');
  return createClient(supabaseUrl, supabaseKey);
}

// ============================================
// Credential Management
// ============================================

async function upsertCredential(
  supabase: any,
  tableName: string,
  data: any,
  uniqueField: string
) {
  const { data: existing, error: selectError } = await supabase
    .from(tableName)
    .select('id')
    .eq(uniqueField, data[uniqueField])
    .limit(1);

  if (selectError) {
    throw new Error(
      `Failed checking existing credentials in ${tableName}: ${selectError.message}`
    );
  }

  if (existing && existing.length > 0) {
    const { error: updateError } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', existing[0].id);

    if (updateError) {
      throw new Error(
        `Failed updating credentials in ${tableName}: ${updateError.message}`
      );
    }
  } else {
    const { error: insertError } = await supabase.from(tableName).insert(data);
    if (insertError) {
      throw new Error(
        `Failed inserting credentials into ${tableName}: ${insertError.message}`
      );
    }
  }
}

async function checkCredentialExists(
  supabase: any,
  tableName: string,
  logs: string[]
): Promise<boolean> {
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

// Individual save functions

export async function saveShopifyCredentials(storeName: string, accessToken: string) {
  const logs: string[] = [];
  const supabase = await getSupabaseClient(logs);
  await upsertCredential(
    supabase,
    'shopify_credentials',
    { store_name: storeName, access_token: accessToken, api_version: apiVerson },
    'store_name'
  );
}

export async function saveAmazonCredentials(credentials: AmazonCredentials) {
  const logs: string[] = [];
  const supabase = await getSupabaseClient(logs);
  await upsertCredential(supabase, 'amazon_credentials', credentials, 'client_id');
}

export async function saveWalmartCredentials(credentials: WalmartCredentials) {
  const logs: string[] = [];
  const supabase = await getSupabaseClient(logs);
  await upsertCredential(supabase, 'walmart_credentials', credentials, 'client_id');
}

export async function saveEbayCredentials(credentials: EbayCredentials) {
  const logs: string[] = [];
  const supabase = await getSupabaseClient(logs);
  await upsertCredential(supabase, 'ebay_credentials', credentials, 'app_id');
}

export async function saveEtsyCredentials(credentials: EtsyCredentials) {
  const logs: string[] = [];
  const supabase = await getSupabaseClient(logs);
  await upsertCredential(supabase, 'etsy_credentials', {keystring: credentials.keystring, client_id: 'etsy'}, 'client_id');
}

export async function saveWayfairCredentials(credentials: WayfairCredentials) {
  const logs: string[] = [];
  const supabase = await getSupabaseClient(logs);
  await upsertCredential(supabase, 'wayfair_credentials', credentials, 'client_id');
}

// ============================================
// Shopify Helpers
// ============================================

async function getShopifyConfig(logs: string[]): Promise<{ storeUrl: string; accessToken: string, apiVersion: string }> {
    const supabase = await getSupabaseClient(logs);
    
    const { data, error } = await supabase
        .from('shopify_credentials')
        .select('store_name, access_token, api_version')
        .limit(1);

    if (error) {
        logs.push(`Supabase error fetching Shopify credentials: ${error.message}`);
        throw new Error('Could not fetch Shopify credentials from the database.');
    }
    if (!data || data.length === 0) {
        logs.push('Shopify credentials not found in the database.');
        throw new Error('Shopify credentials have not been configured. Please add them in the Connections settings.');
    }
    
    logs.push("Successfully fetched Shopify credentials.");
    const { store_name, access_token, api_version } = data[0];
    const storeUrl = getStoreUrl(store_name);
    
    const apiVersion = api_version || '2025-07';
    logs.push(`Using Shopify API version: ${apiVersion}`);

    return { storeUrl, accessToken: access_token, apiVersion };
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

export async function getShopifyProducts(options: { countOnly?: boolean } = {}): Promise<{ rawProducts: ShopifyProduct[], count?: number, logs: string[] }> {
    const logs: string[] = [];
    try {
        const { storeUrl, accessToken, apiVersion } = await getShopifyConfig(logs);
        const endpoint = options.countOnly ? 'products/count.json' : 'products.json?limit=250';
        const url = `${storeUrl}/admin/api/${apiVersion}/${endpoint}`;
        
        logs.push(`Fetching from: ${url}`);
        const response = await safeFetch(url, {
            headers: { 'X-Shopify-Access-Token': accessToken }
        }, logs);

        if (!response.ok) {
            const errorBody = await response.text();
            logs.push(`Shopify API Error: ${response.status} ${response.statusText} - ${errorBody}`);
            throw new Error(`Failed to fetch from Shopify: ${response.statusText}`);
        }

        const data: any = await response.json();

        if (options.countOnly) {
            logs.push(`Product count: ${data.count}`);
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


export async function createShopifyProduct(productData: ShopifyProductCreation): Promise<{ product: ShopifyProduct, logs: string[] }> {
    const logs: string[] = [];
    try {
        const { storeUrl, accessToken, apiVersion } = await getShopifyConfig(logs);
        const url = `${storeUrl}/admin/api/${apiVersion}/products.json`;

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
                'X-Shopify-Access-Token': accessToken,
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

export async function updateShopifyProduct(productData: ShopifyProductUpdate): Promise<{ product: ShopifyProduct, logs: string[] }> {
    const logs: string[] = [];
    try {
        const { storeUrl, accessToken, apiVersion } = await getShopifyConfig(logs);
        const url = `${storeUrl}/admin/api/${apiVersion}/products/${productData.id}.json`;

        const body = JSON.stringify({ product: productData });
        
        logs.push(`Updating product ${productData.id} with body:`, body);

        const response = await safeFetch(url, {
            method: 'PUT',
            headers: {
                'X-Shopify-Access-Token': accessToken,
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

export async function getShopifyProduct(id: number): Promise<{ product: ShopifyProduct | null, logs: string[] }> {
    const logs: string[] = [];
    try {
        const { storeUrl, accessToken, apiVersion } = await getShopifyConfig(logs);
        const url = `${storeUrl}/admin/api/${apiVersion}/products/${id}.json`;
        
        logs.push(`Fetching product with ID: ${id}`);
        const response = await safeFetch(url, {
            headers: { 'X-Shopify-Access-Token': accessToken }
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

export async function getShopifyOrders(options: { createdAtMin?: string, createdAtMax?: string }): Promise<{ orders: ShopifyOrder[], logs: string[] }> {
    const logs: string[] = [];
    try {
        const { storeUrl, accessToken, apiVersion } = await getShopifyConfig(logs);
        const params = new URLSearchParams({
            status: 'any',
            limit: '250',
            ...(options.createdAtMin && { created_at_min: options.createdAtMin }),
            ...(options.createdAtMax && { created_at_max: options.createdAtMax }),
        });

        const url = `${storeUrl}/admin/api/${apiVersion}/orders.json?${params.toString()}`;
        logs.push(`Fetching orders from: ${url}`);
        
        const response = await safeFetch(url, { headers: { 'X-Shopify-Access-Token': accessToken } }, logs);

        if (!response.ok) throw new Error(`Failed to fetch Shopify orders: ${response.statusText}`);

        const data: { orders: ShopifyOrder[] } = await response.json() as any;
        logs.push(`Successfully fetched ${data.orders.length} orders.`);
        return { orders: data.orders, logs };
    } catch (e) {
        logs.push(`Error in getShopifyOrders: ${e instanceof Error ? e.message : 'Unknown error'}`);
        throw e;
    }
}


// ============================================
// External Platform Functions
// ============================================
export async function getPlatformProductCounts(logs: string[]): Promise<PlatformProductCount[]> {
    const supabase = await getSupabaseClient(logs);
    const counts: PlatformProductCount[] = [];

    // Mocking counts for now
    const platforms = ['Amazon', 'Walmart', 'eBay', 'Etsy', 'Wayfair'];
    for (const platform of platforms) {
        const tableName = `${platform.toLowerCase()}_credentials`;
        const connected = await checkCredentialExists(supabase, tableName, logs);
        if (connected) {
            logs.push(`Fetching count for connected platform: ${platform}`);
            // In a real scenario, you'd make an API call to the platform
            // For now, we return a mock count if connected.
            counts.push({ platform, count: Math.floor(Math.random() * 5000) });
        } else {
             counts.push({ platform, count: 0 });
        }
    }
    return counts;
}

export async function getWalmartOrders(options: { createdStartDate?: string, limit?: string }): Promise<{ orders: ShopifyOrder[], logs: string[] }> {
    const logs: string[] = [];
    const supabase = await getSupabaseClient(logs);

    try {
        const { data: credsData, error: credsError } = await supabase.from('walmart_credentials').select('client_id, client_secret').limit(1);

        if (credsError) throw new Error(`Supabase error fetching Walmart credentials: ${credsError.message}`);
        if (!credsData || credsData.length === 0) throw new Error('Walmart credentials not configured.');
        
        const { client_id: consumerId, client_secret: privateKey } = credsData[0];
        const baseUrl = 'https://marketplace.walmartapis.com/v3/orders';
        const timestamp = Date.now().toString();
        const correlationId = uuidv4();

        const params = new URLSearchParams({
            limit: options.limit || '100',
            ...(options.createdStartDate && { createdStartDate: options.createdStartDate }),
        });
        const requestUrl = `${baseUrl}?${params.toString()}`;
        
        const signature = getWalmartSignature(consumerId, privateKey, requestUrl, 'GET', timestamp);

        logs.push('Fetching Walmart orders...');
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'WM_SEC.ACCESS_TOKEN': signature,
                'WM_QOS.CORRELATION_ID': correlationId,
                'WM_SVC.NAME': 'Walmart Marketplace',
                'WM_CONSUMER.ID': consumerId,
                'WM_SEC.TIMESTAMP': timestamp,
                'Accept': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch Walmart orders: ${response.statusText} - ${errorText}`);
        }

        const data: { list: { elements: { order: WalmartOrder[] } } } = await response.json() as any;
        
        if (!data.list || !data.list.elements || !data.list.elements.order) {
            logs.push('No orders found in Walmart response.');
            return { orders: [], logs };
        }
        
        const mappedOrders = data.list.elements.order.map(mapWalmartOrderToShopifyOrder);
        logs.push(`Successfully fetched and mapped ${mappedOrders.length} Walmart orders.`);
        return { orders: mappedOrders, logs };

    } catch(e) {
        logs.push(`Error in getWalmartOrders: ${e instanceof Error ? e.message : 'Unknown error'}`);
        throw e;
    }
}


// ============================================
// Walmart Helpers
// ============================================

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


    