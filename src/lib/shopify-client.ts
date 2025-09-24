


import 'dotenv/config';
import type {
  MappedShopifyProduct,
  ShopifyProduct,
  ShopifyOrder,
  ShopifyProductCreation,
  ShopifyProductUpdate,
  WalmartOrder,
  AppSettings,
  ShopifyCredentials,
  AmazonOrder,
  AmazonOrderItem,
} from './types';
import { PlaceHolderImages } from './placeholder-images';
import fetch, { type Response } from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';


export interface PlatformProductCount {
  platform: string;
  count: number;
}

const apiVersionDefault = '2025-07';

// ============================================
// Credential Management is now handled by .env
// ============================================

function checkEnvVar(variableName: string): boolean {
    return !!process.env[variableName] && !process.env[variableName]?.includes('your-');
}

export async function getCredentialStatuses(): Promise<Record<string, boolean>> {
  return {
      'shopify': checkEnvVar('SHOPIFY_STORE_NAME') && checkEnvVar('SHOPIFY_ACCESS_TOKEN'),
      'amazon': checkEnvVar('AMAZON_REFRESH_TOKEN') && checkEnvVar('AMAZON_SELLER_ID') && checkEnvVar('AMAZON_CLIENT_ID') && checkEnvVar('AMAZON_CLIENT_SECRET'),
      'walmart': checkEnvVar('WALMART_CLIENT_ID') && checkEnvVar('WALMART_CLIENT_SECRET'),
      'ebay': false, // eBay not implemented
      'etsy': checkEnvVar('ETSY_API_KEY'), // Assuming ETSY_API_KEY for Etsy
      'wayfair': false,
  };
}


// ============================================
// Shopify Helpers
// ============================================

function getShopifyConfig(logs: string[]): ShopifyCredentials | null {
    logs.push("Reading Shopify credentials from .env file...");
    const storeName = process.env.SHOPIFY_STORE_NAME;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
    
    if (!storeName || !accessToken || storeName === 'your-store-name') {
        logs.push(`Shopify credentials not found or are placeholders in .env file.`);
        return null;
    }

    logs.push(`Successfully read credentials for store: ${storeName}`);
    return {
        store_name: storeName,
        access_token: accessToken,
        api_version: apiVersionDefault
    } as ShopifyCredentials;
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

export async function getShopifyProducts(options: { countOnly?: boolean }): Promise<{ rawProducts: ShopifyProduct[], count?: number, logs: string[] }> {
    const logs: string[] = [];
    try {
        const config = getShopifyConfig(logs);
        if (!config) {
            return { rawProducts: [], count: 0, logs };
        }
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
            // Instead of throwing, return an empty state
            return { rawProducts: [], count: 0, logs };
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
        // Return empty state on error
        return { rawProducts: [], count: 0, logs };
    }
}

export async function createShopifyProduct(productData: ShopifyProductCreation): Promise<{ product: ShopifyProduct, logs: string[] }> {
    const logs: string[] = [];
    try {
        const config = getShopifyConfig(logs);
         if (!config) {
            throw new Error("Shopify credentials are not configured in .env file.");
        }
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

export async function updateShopifyProduct(productData: ShopifyProductUpdate): Promise<{ product: ShopifyProduct, logs: string[] }> {
    const logs: string[] = [];
    try {
        const config = getShopifyConfig(logs);
        if (!config) {
            throw new Error("Shopify credentials are not configured in .env file.");
        }
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

export async function getShopifyProduct(id: number): Promise<{ product: ShopifyProduct | null, logs: string[] }> {
    const logs: string[] = [];
    try {
        const config = getShopifyConfig(logs);
        if (!config) {
            throw new Error("Shopify credentials are not configured in .env file.");
        }
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

export async function getShopifyOrders(options: { dateRange?: DateRange }): Promise<{ orders: ShopifyOrder[]; logs: string[] }> {
  const logs: string[] = [];
  try {
    const config = getShopifyConfig(logs);
    if (!config) {
        return { orders: [], logs };
    }
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
      // Instead of throwing, return an empty array
      return { orders: [], logs };
    }

    const data: { orders: ShopifyOrder[] } = await response.json() as any;
    logs.push(`Successfully fetched ${data.orders.length} orders from Shopify.`);
    return { orders: data.orders, logs };
  } catch (error) {
    if (error instanceof Error) {
      logs.push(`Error in getShopifyOrders: ${error.message}`);
    }
    // Return empty state on error
    return { orders: [], logs };
  }
}


// ============================================
// External Platform Functions
// ============================================
export async function getPlatformProductCounts(logs: string[]): Promise<PlatformProductCount[]> {
    const counts: PlatformProductCount[] = [];
    const statuses = await getCredentialStatuses();

    // Mocking counts for now
    const platforms = ['Shopify', 'Amazon', 'Walmart', 'eBay', 'Etsy'];
    for (const platform of platforms) {
        const platformKey = platform.toLowerCase();
        if (statuses[platformKey]) {
            logs.push(`Fetching count for connected platform: ${platform}`);
            // In a real scenario, you'd make an API call to the platform
            // For now, we return a mock count if connected.
            if (platform === 'Shopify') {
                 const { count } = await getShopifyProducts({ countOnly: true });
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

function getWalmartConfig(logs: string[]): { clientId: string; clientSecret: string; } | null {
    logs.push("Reading Walmart credentials from .env file...");
    const clientId = process.env.WALMART_CLIENT_ID;
    const clientSecret = process.env.WALMART_CLIENT_SECRET;

    if (!clientId || !clientSecret || clientId === 'your-walmart-client-id') {
        logs.push(`Walmart credentials not found or are placeholders in .env file.`);
        return null;
    }

    logs.push(`Successfully read Walmart credentials.`);
    return { clientId, clientSecret };
}


async function getWalmartAccessToken(clientId: string, clientSecret: string, logs: string[]): Promise<string | null> {
    const url = 'https://marketplace.walmartapis.com/v3/token';
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const correlationId = uuidv4();

    logs.push('Requesting Walmart access token...');
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'WM_QOS.CORRELATION_ID': correlationId,
                'WM_SVC.NAME': 'Walmart-Marketplace-Api',
                'Accept': 'application/json'
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            const errorBody = await response.text();
            logs.push(`Walmart Token API Error: ${response.status} - ${errorBody}`);
            return null;
        }

        const data: any = await response.json();
        logs.push('Successfully retrieved Walmart access token.');
        return data.access_token;
    } catch(e) {
        if (e instanceof Error) {
            logs.push(`Network error fetching Walmart token: ${e.message}`);
        }
        return null;
    }
}


export async function getWalmartOrders(options: { dateRange?: DateRange }): Promise<{ orders: ShopifyOrder[]; logs: string[] }> {
  const logs: string[] = [];
  try {
    const config = getWalmartConfig(logs);
    if (!config) {
        return { orders: [], logs };
    }
    const accessToken = await getWalmartAccessToken(config.clientId, config.clientSecret, logs);
    if (!accessToken) {
         return { orders: [], logs };
    }
    
    const correlationId = uuidv4();
    
    const params = new URLSearchParams();
    if (options.dateRange?.from) {
        params.append('createdStartDate', options.dateRange.from.toISOString());
    } else {
        // Default to last 15 days if no start date
        const fifteenDaysAgo = subDays(new Date(), 14);
        params.append('createdStartDate', fifteenDaysAgo.toISOString());
    }
     if (options.dateRange?.to) {
        params.append('createdEndDate', options.dateRange.to.toISOString());
    }

    const url = `https://marketplace.walmartapis.com/v3/orders?${params.toString()}`;

    logs.push('Fetching Walmart orders...');
    const response = await fetch(url, {
      headers: {
        'WM_SEC.ACCESS_TOKEN': accessToken,
        'WM_QOS.CORRELATION_ID': correlationId,
        'WM_SVC.NAME': 'Walmart-Marketplace-Api',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logs.push(`Walmart Orders API Error: ${response.status} - ${errorBody}`);
      return { orders: [], logs };
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
    return { orders: [], logs };
  }
}

function mapWalmartOrderToShopifyOrder(walmartOrder: WalmartOrder): ShopifyOrder {
  let subtotal = 0;
  let totalTax = 0;
  let totalShipping = 0;

  walmartOrder.orderLines.orderLine.forEach(line => {
    line.charges.charge.forEach(charge => {
        const chargeAmount = Number(charge.chargeAmount?.amount || 0);
        const taxAmount = Number(charge.tax?.taxAmount?.amount || 0);
        
        if (charge.chargeType === 'PRODUCT') {
            subtotal += chargeAmount;
            totalTax += taxAmount;
        } else if (charge.chargeType === 'SHIPPING') {
            totalShipping += chargeAmount;
             totalTax += taxAmount; // Shipping tax is also a tax
        }
    });
  });

  const orderTotal = subtotal + totalTax + totalShipping;

  const nameParts = walmartOrder.shippingInfo.postalAddress.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const latestStatusLine = walmartOrder.orderLines.orderLine.reduce((latest, current) => {
    return (new Date(current.statusDate) > new Date(latest.statusDate)) ? current : latest;
  });
  
  const fulfillmentStatus = latestStatusLine.status;

  return {
    id: walmartOrder.purchaseOrderId,
    admin_graphql_api_id: `gid://walmart/Order/${walmartOrder.purchaseOrderId}`,
    name: walmartOrder.purchaseOrderId,
    created_at: new Date(walmartOrder.orderDate).toISOString(),
    updated_at: new Date(latestStatusLine.statusDate).toISOString(),
    total_price: orderTotal.toFixed(2),
    subtotal_price: subtotal.toFixed(2),
    total_tax: totalTax.toFixed(2),
    total_shipping: totalShipping.toFixed(2),
    total_discounts: '0.00',
    currency:
      walmartOrder.orderLines.orderLine[0]?.charges.charge[0]?.chargeAmount.currency ||
      'USD',
    financial_status: fulfillmentStatus === 'Created' ? 'pending' : 'paid',
    fulfillment_status: fulfillmentStatus,
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
      price: line.charges.charge.find(c => c.chargeType === 'PRODUCT')?.chargeAmount.amount.toFixed(2) || '0.00',
      sku: line.item.sku,
      vendor: 'Walmart',
    })),
    processed_at: new Date(walmartOrder.orderDate).toISOString(),
  };
}


// ============================================
// Amazon Helpers
// ============================================

async function getAmazonAccessToken(logs: string[]): Promise<string | null> {
    const refreshToken = process.env.AMAZON_REFRESH_TOKEN;
    const clientId = process.env.AMAZON_CLIENT_ID;
    const clientSecret = process.env.AMAZON_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
        logs.push('Amazon token credentials missing from .env file.');
        return null;
    }

    const url = 'https://api.amazon.com/auth/o2/token';
    const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret
    });

    try {
        logs.push('Requesting Amazon SP-API access token...');
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString()
        });

        const data: any = await response.json();
        
        if (!response.ok) {
            logs.push(`Amazon Token API Error: ${response.status} - ${JSON.stringify(data)}`);
            return null;
        }

        logs.push('Successfully retrieved Amazon access token.');
        return data.access_token;
    } catch (e) {
        if (e instanceof Error) {
            logs.push(`Network error fetching Amazon token: ${e.message}`);
        }
        return null;
    }
}


export async function getAmazonOrders(options: { dateRange?: DateRange }): Promise<{ orders: ShopifyOrder[]; logs: string[] }> {
    const logs: string[] = [];
    const accessToken = await getAmazonAccessToken(logs);
    const marketplaceId = process.env.AMAZON_MARKETPLACE_ID;

    if (!accessToken || !marketplaceId) {
        logs.push("Amazon credentials or Marketplace ID not configured properly.");
        return { orders: [], logs };
    }

    try {
        const allAmazonOrders: AmazonOrder[] = [];
        let nextToken: string | undefined = undefined;

        const baseParams: any = {
            MarketplaceIds: marketplaceId,
            CreatedAfter: options.dateRange?.from?.toISOString() || subDays(new Date(), 15).toISOString(),
        };

        logs.push(`Starting to fetch Amazon orders with params: ${JSON.stringify(baseParams)}`);

        do {
            const params = new URLSearchParams(baseParams);
            if (nextToken) {
                params.set('NextToken', nextToken);
            }
            
            const orderUrl = `https://sellingpartnerapi-na.amazon.com/orders/v0/orders?${params.toString()}`;
            
            logs.push(`Fetching Amazon orders page from: ${orderUrl}`);
            const orderResponse = await fetch(orderUrl, {
                headers: { 'x-amz-access-token': accessToken }
            });

            const orderData: any = await orderResponse.json();
            
            if (!orderResponse.ok) {
                logs.push(`Amazon Orders API Error: ${orderResponse.status} - ${JSON.stringify(orderData)}`);
                // Stop fetching if an error occurs
                break;
            }

            const newOrders: AmazonOrder[] = orderData.payload?.Orders || [];
            allAmazonOrders.push(...newOrders);
            logs.push(`Fetched ${newOrders.length} orders. Total fetched so far: ${allAmazonOrders.length}.`);

            nextToken = orderData.payload?.NextToken;
            if (nextToken) {
                logs.push(`Received NextToken, will fetch next page.`);
            }

        } while (nextToken);
        
        logs.push(`Finished fetching all ${allAmazonOrders.length} Amazon order headers.`);
        
        if (allAmazonOrders.length === 0) {
            return { orders: [], logs };
        }

        const mappedOrders: ShopifyOrder[] = [];
        for (const order of allAmazonOrders) {
             let orderItems: AmazonOrderItem[] = [];
             try {
                const itemsUrl = `https://sellingpartnerapi-na.amazon.com/orders/v0/orders/${order.AmazonOrderId}/orderItems`;
                logs.push(`Fetching items for Amazon order ${order.AmazonOrderId}`);
                const itemsRes = await fetch(itemsUrl, {
                    headers: { 'x-amz-access-token': accessToken }
                });
                const itemsData = await itemsRes.json();
                if (itemsRes.ok) {
                    orderItems = itemsData.payload?.OrderItems || [];
                } else {
                     logs.push(`Could not fetch items for Amazon order ${order.AmazonOrderId}: ${JSON.stringify(itemsData)}`);
                }
            } catch (e) {
                if (e instanceof Error) {
                    logs.push(`Error fetching items for Amazon order ${order.AmazonOrderId}: ${e.message}`);
                }
            }
            mappedOrders.push(mapAmazonOrderToShopifyOrder(order, orderItems));
        }
        
        logs.push(`Successfully mapped ${mappedOrders.length} Amazon orders.`);
        return { orders: mappedOrders, logs };

    } catch (e) {
        if (e instanceof Error) {
            logs.push(`[12] Error in getAmazonOrders: ${e.message}`);
        }
        return { orders: [], logs };
    }
}


function mapAmazonOrderToShopifyOrder(amazonOrder: AmazonOrder, items: AmazonOrderItem[]): ShopifyOrder {
    const financialStatus = amazonOrder.OrderStatus === 'Pending' ? 'pending' : 'paid';

    let subtotal = 0;
    let totalShipping = 0;
    let totalTax = 0;
    let totalDiscounts = 0;

    items.forEach(item => {
        subtotal += parseFloat(item.ItemPrice?.Amount || '0');
        totalShipping += parseFloat(item.ShippingPrice?.Amount || '0');
        totalTax += parseFloat(item.ItemTax?.Amount || '0');
        totalDiscounts += parseFloat(item.PromotionDiscount?.Amount || '0');
    });
    
    const shippingAddress = amazonOrder.ShippingAddress;
    const nameParts = shippingAddress?.Name ? shippingAddress.Name.split(' ') : [];
    const firstName = nameParts[0] || null;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;


    return {
        id: amazonOrder.AmazonOrderId,
        admin_graphql_api_id: `gid://amazon/Order/${amazonOrder.AmazonOrderId}`,
        name: amazonOrder.AmazonOrderId,
        created_at: amazonOrder.PurchaseDate,
        updated_at: amazonOrder.LastUpdateDate,
        total_price: amazonOrder.OrderTotal?.Amount || '0.00',
        subtotal_price: subtotal.toFixed(2),
        total_tax: totalTax.toFixed(2),
        total_shipping: totalShipping.toFixed(2),
        total_discounts: totalDiscounts.toFixed(2),
        currency: amazonOrder.OrderTotal?.CurrencyCode || 'USD',
        financial_status: financialStatus,
        fulfillment_status: amazonOrder.OrderStatus,
        customer: {
            id: null,
            email: amazonOrder.BuyerInfo?.BuyerEmail || null,
            first_name: firstName,
            last_name: lastName,
            phone: shippingAddress?.Phone || null,
        },
        shipping_address: shippingAddress ? {
            first_name: firstName,
            last_name: lastName,
            address1: shippingAddress.AddressLine1 || null,
            address2: shippingAddress.AddressLine2,
            city: shippingAddress.City || null,
            province: shippingAddress.StateOrRegion || null,
            country: shippingAddress.CountryCode || null,
            zip: shippingAddress.PostalCode || null,
            phone: shippingAddress.Phone,
            country_code: shippingAddress.CountryCode,
        } : null,
        line_items: items.map(item => ({
            id: item.OrderItemId,
            title: item.Title,
            quantity: item.QuantityOrdered,
            price: item.ItemPrice?.Amount || '0.00',
            sku: item.SellerSKU,
            vendor: 'Amazon',
        })),
    };
}

// ============================================
// Product Fetching Stubs
// ============================================

export async function getAmazonProducts(): Promise<{ products: ShopifyProduct[]; logs: string[] }> {
    const logs: string[] = ["Amazon product fetching is not implemented yet. Returning mock data."];
    // In a real app, you would fetch products from the Amazon SP-API.
    return { products: [], logs };
}

export async function getWalmartProducts(): Promise<{ products: ShopifyProduct[]; logs: string[] }> {
    const logs: string[] = ["Walmart product fetching is not implemented yet. Returning mock data."];
     // In a real app, you would fetch products from the Walmart Marketplace API.
    return { products: [], logs };
}

export async function getEtsyProducts(): Promise<{ products: ShopifyProduct[]; logs: string[] }> {
    const logs: string[] = ["Etsy product fetching is not implemented yet. Returning mock data."];
     // In a real app, you would fetch products from the Etsy API.
    return { products: [], logs };
}
