
'use server';

import { getShopifyProducts, createShopifyProduct, updateShopifyProduct, getShopifyProduct, saveShopifyCredentials, saveAmazonCredentials, saveWalmartCredentials, saveEbayCredentials, saveEtsyCredentials, saveWayfairCredentials, getCredentialStatuses, getShopifyOrders, getWalmartOrders, getWebsiteProducts, getPlatformProductCounts, getWebsiteProductCount } from '@/lib/shopify-client';
import { syncProductsToWebsite } from '@/lib/website-supabase-client';
import type { ShopifyProductCreation, ShopifyProduct, ShopifyProductUpdate, AmazonCredentials, WalmartCredentials, EbayCredentials, EtsyCredentials, WayfairCredentials, ShopifyOrder } from '@/lib/types';
import { optimizeListing, type OptimizeListingInput } from '@/ai/flows/optimize-listing-flow';
import { optimizeContent, type OptimizeContentInput } from '@/ai/flows/optimize-content-flow';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';


export async function handleSyncProducts() {
  try {
    // We now get the rawProducts array from the API response
    const { rawProducts } = await getShopifyProducts();
    if (!rawProducts || rawProducts.length === 0) {
      return { success: false, error: 'No products found to sync.' };
    }
    // We pass the raw, complete product objects to the sync function
    await syncProductsToWebsite(rawProducts);
    return { success: true, error: null, count: rawProducts.length };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
     console.error('Sync failed:', errorMessage);
    return { success: false, error: `Failed to sync products: ${errorMessage}` };
  }
}

export async function handleCreateProduct(productData: ShopifyProductCreation) {
  try {
    // Create product in Shopify
    const { product: newShopifyProduct } = await createShopifyProduct(productData);
    
    // Sync the newly created product to our website's Supabase
    await syncProductsToWebsite([newShopifyProduct]);

    return { success: true, error: null, product: newShopifyProduct };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Product creation failed:', errorMessage);
    return { success: false, error: `Failed to create product: ${errorMessage}` };
  }
}

export async function handleUpdateProduct(productData: ShopifyProductUpdate) {
  try {
    // Update product in Shopify
    const { product: updatedShopifyProduct } = await updateShopifyProduct(productData);

    // Re-sync the updated product to our website's Supabase
    await syncProductsToWebsite([updatedShopifyProduct]);

    return { success: true, error: null, product: updatedShopifyProduct };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Product update failed:', errorMessage);
    return { success: false, error: `Failed to update product: ${errorMessage}` };
  }
}

export async function handleGetProduct(id: number) {
  try {
    const { product } = await getShopifyProduct(id);
    if (!product) {
      return { product: null, error: `Product with ID ${id} not found.`};
    }
    return { product, error: null };
  } catch (e) {
     const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Get product failed:', errorMessage);
    return { product: null, error: `Failed to retrieve product: ${errorMessage}` };
  }
}

export async function handleGetCredentialStatuses() {
    try {
        const statuses = await getCredentialStatuses();
        return { success: true, statuses, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to get credential statuses:', errorMessage);
        return { success: false, statuses: {}, error: `Failed to get statuses: ${errorMessage}` };
    }
}

export async function handleSaveShopifyCredentials(storeName: string, accessToken: string) {
    try {
        await saveShopifyCredentials(storeName, accessToken);
        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to save Shopify credentials:', errorMessage);
        return { success: false, error: `Failed to save credentials: ${errorMessage}` };
    }
}

export async function handleSaveAmazonCredentials(credentials: AmazonCredentials) {
    try {
        await saveAmazonCredentials(credentials);
        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to save Amazon credentials:', errorMessage);
        return { success: false, error: `Failed to save credentials: ${errorMessage}` };
    }
}

export async function handleSaveWalmartCredentials(credentials: WalmartCredentials) {
    try {
        await saveWalmartCredentials(credentials);
        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to save Walmart credentials:', errorMessage);
        return { success: false, error: `Failed to save credentials: ${errorMessage}` };
    }
}

export async function handleSaveEbayCredentials(credentials: EbayCredentials) {
    try {
        await saveEbayCredentials(credentials);
        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to save eBay credentials:', errorMessage);
        return { success: false, error: `Failed to save credentials: ${errorMessage}` };
    }
}

export async function handleSaveEtsyCredentials(credentials: EtsyCredentials) {
    try {
        await saveEtsyCredentials(credentials);
        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to save Etsy credentials:', errorMessage);
        return { success: false, error: `Failed to save credentials: ${errorMessage}` };
    }
}

export async function handleSaveWayfairCredentials(credentials: WayfairCredentials) {
    try {
        await saveWayfairCredentials(credentials);
        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to save Wayfair credentials:', errorMessage);
        return { success: false, error: `Failed to save credentials: ${errorMessage}` };
    }
}

export async function handleOptimizeListing(input: OptimizeListingInput) {
    try {
        const result = await optimizeListing(input);
        return { success: true, data: result, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during optimization.';
        console.error('Listing optimization failed:', errorMessage);
        return { success: false, data: null, error: `Failed to optimize listing: ${errorMessage}` };
    }
}

export async function handleOptimizeContent(input: OptimizeContentInput) {
    try {
        const result = await optimizeContent(input);
        return { success: true, data: result, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during content optimization.';
        console.error('Content optimization failed:', errorMessage);
        return { success: false, data: null, error: `Failed to optimize content: ${errorMessage}` };
    }
}

export async function handleGetShopifyOrders(dateRange?: DateRange) {
  try {
    const { orders } = await getShopifyOrders(dateRange);
    return { success: true, orders, error: null };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { success: false, orders: [], error: `Failed to fetch Shopify orders: ${errorMessage}` };
  }
}

export async function handleGetWalmartOrders() {
  try {
    const { orders } = await getWalmartOrders();
    return { success: true, orders, error: null };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { success: false, orders: [], error: `Failed to fetch Walmart orders: ${errorMessage}` };
  }
}


// Placeholder actions for order management
export async function handleRefundOrder(orderId: string | number, platform: string) {
    console.log(`Refunding order ${orderId} on ${platform}`);
    // In a real app, call the platform's refund API
    await new Promise(res => setTimeout(res, 500));
    return { success: true, message: `Order ${orderId} refund processed.` };
}

export async function handleCancelOrder(orderId: string | number, platform: string) {
    console.log(`Cancelling order ${orderId} on ${platform}`);
    // In a real app, call the platform's cancel API
    await new Promise(res => setTimeout(res, 500));
    return { success: true, message: `Order ${orderId} has been cancelled.` };
}

export async function handleShipOrder(orderId: string | number, platform: string) {
    console.log(`Shipping order ${orderId} on ${platform}`);
    // In a real app, call the platform's fulfillment/shipping API
    await new Promise(res => setTimeout(res, 500));
    return { success: true, message: `Order ${orderId} has been marked as shipped.` };
}

export async function handleGetWebsiteProducts() {
    try {
        const { rawProducts } = await getWebsiteProducts();
        return { success: true, products: rawProducts, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { success: false, products: [], error: `Failed to fetch website products: ${errorMessage}` };
    }
}


// Dashboard Actions
async function getSalesData(dateRange?: DateRange): Promise<number> {
    // In a real app, you would fetch orders from all connected platforms.
    // For now, we'll just use Shopify as the source.
    try {
        const { orders } = await getShopifyOrders(dateRange);
        return orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
    } catch (error) {
        console.error("Failed to fetch sales data:", error);
        return 0;
    }
}

export async function getDashboardStats(dateRange?: DateRange) {
    const defaultRange: DateRange = { from: subDays(new Date(), 6), to: new Date() };
    const range = dateRange || defaultRange;

    try {
        const [
            totalSales,
            platformCounts,
            websiteProductCount
        ] = await Promise.all([
            getSalesData(range),
            getPlatformProductCounts([]),
            getWebsiteProductCount([])
        ]);

        return {
            success: true,
            stats: {
                totalSales,
                platformCounts,
                websiteProductCount,
            },
            error: null,
        };

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Dashboard stat fetching failed:', errorMessage);
        return {
            success: false,
            stats: null,
            error: `Failed to load dashboard stats: ${errorMessage}`
        };
    }
}
