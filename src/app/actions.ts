

'use server';

import { getShopifyProducts, createShopifyProduct, updateShopifyProduct, getShopifyProduct, getCredentialStatuses, getShopifyOrders, getWalmartOrders, getAmazonOrders, getPlatformProductCounts, getEtsyProducts, updateEtsyProduct, updateWalmartProduct, getAmazonProductBySku, getWalmartProductBySku, updateAmazonProduct } from '@/lib/shopify-client';
import { syncProductsToWebsite, getWebsiteProducts, getWebsiteProductCount, getSingleWebsiteProduct, updateProductMarketplaceId, getProductBySku } from '@/lib/website-supabase-client';
import type { ShopifyProductCreation, ShopifyProduct, ShopifyProductUpdate, ShopifyOrder, Agency, User, Profile, AppSettings, PriceUpdatePayload, StockUpdatePayload } from '@/lib/types';
import { optimizeListing, type OptimizeListingInput } from '@/ai/flows/optimize-listing-flow';
import { optimizeContent, type OptimizeContentInput } from '@/ai/flows/optimize-content-flow';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import fs from 'fs/promises';
import path from 'path';


export async function handleSyncProducts() {
  try {
    // We now get the rawProducts array from the API response
    const { rawProducts } = await getShopifyProducts({});
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
    // 1. Update product in Shopify (source of truth)
    const { product: updatedShopifyProduct } = await updateShopifyProduct(productData);

    // 2. Re-sync the updated product to our website's Supabase database
    await syncProductsToWebsite([updatedShopifyProduct]);

    // 3. Fetch sync settings
    const settingsResult = await handleGetSettings();
    if (!settingsResult.success || !settingsResult.settings) {
        console.warn("Could not retrieve sync settings. Skipping external marketplace updates.");
        return { success: true, error: null, product: updatedShopifyProduct };
    }

    const syncSettings = settingsResult.settings;

    // 4. Iterate through marketplaces and apply updates
    for (const marketPlaceSetting of syncSettings.marketplaces) {
        if (marketPlaceSetting.id === 'shopify' || (!marketPlaceSetting.syncInventory && !marketPlaceSetting.syncPrice)) {
            continue; // Skip Shopify or marketplaces with no sync enabled
        }
        
        console.log(`Processing sync for marketplace: ${marketPlaceSetting.id}`);

        const variant = updatedShopifyProduct.variants[0];
        if (!variant) continue;

        let newPrice: number | undefined = undefined;
        if (marketPlaceSetting.syncPrice) {
            const basePrice = parseFloat(variant.price);
            const adjustment = marketPlaceSetting.priceAdjustment || 0;
            newPrice = basePrice * (1 + adjustment / 100);
        }

        let newInventory: number | undefined = undefined;
        if (marketPlaceSetting.syncInventory) {
             if (marketPlaceSetting.autoUpdateInventory) {
                newInventory = marketPlaceSetting.defaultInventory ?? 0;
            } else {
                newInventory = variant.inventory_quantity;
            }
        }
        
        // Construct payload for the external marketplace
        const externalUpdatePayload = {
            sku: variant.sku, // Use SKU to identify product on other platforms
            price: newPrice,
            inventory: newInventory,
        };

        // Call the specific update function for the marketplace
        try {
            switch (marketPlaceSetting.id) {
                case 'etsy':
                    await updateEtsyProduct(externalUpdatePayload);
                    console.log(`Successfully triggered update for SKU ${variant.sku} on Etsy.`);
                    break;
                case 'walmart':
                    await updateWalmartProduct(externalUpdatePayload);
                    console.log(`Successfully triggered update for SKU ${variant.sku} on Walmart.`);
                    break;
                // Add cases for other marketplaces like 'amazon', 'ebay'
                default:
                    console.log(`Update function for ${marketPlaceSetting.id} is not implemented.`);
            }
        } catch (e) {
             const errorMsg = e instanceof Error ? e.message : 'Unknown error';
             console.error(`Failed to update product on ${marketPlaceSetting.id}: ${errorMsg}`);
             // Continue to next marketplace even if one fails
        }
    }


    return { success: true, error: null, product: updatedShopifyProduct };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Product update failed:', errorMessage);
    return { success: false, error: `Failed to update product: ${errorMessage}` };
  }
}

export async function handleGetProduct(id: string) {
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

export async function handleGetProductBySku(sku: string): Promise<{ product: ShopifyProduct | null, error: string | null }> {
    try {
        const product = await getProductBySku(sku);
        if (!product) {
            return { product: null, error: `Product with SKU ${sku} not found in the local database.` };
        }
        return { product, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Get product by SKU failed:', errorMessage);
        return { product: null, error: `Failed to retrieve product by SKU: ${errorMessage}` };
    }
}


export async function handleGetCredentialStatuses(): Promise<{ success: boolean; statuses: Record<string, boolean>; error: string | null; }> {
    try {
        const statuses = await getCredentialStatuses();
        return { success: true, statuses, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to get credential statuses:', errorMessage);
        return { success: false, statuses: {}, error: `Failed to get statuses: ${errorMessage}` };
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
    const { orders, logs } = await getShopifyOrders({ dateRange });
    return { success: true, orders, error: null, logs };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { success: false, orders: [], error: `Failed to fetch Shopify orders: ${errorMessage}`, logs: [] };
  }
}

export async function handleGetWalmartOrders(dateRange?: DateRange) {
  try {
    const { orders, logs } = await getWalmartOrders({ dateRange });
    return { success: true, orders, error: null, logs };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { success: false, orders: [], error: `Failed to fetch Walmart orders: ${errorMessage}`, logs: [] };
  }
}

export async function handleGetAmazonOrders(dateRange?: DateRange) {
    try {
        const { orders, logs } = await getAmazonOrders({ dateRange });
        if (orders.length === 0 && logs.length > 0) {
            // If there are logs, but no orders, there might be a non-critical issue we want to see.
            // Don't set an error so the UI shows "No orders" but still shows logs.
        }
        return { success: true, orders, error: null, logs };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        // A catch block means a definite error occurred.
        return { success: false, orders: [], error: `Failed to fetch Amazon orders: ${errorMessage}`, logs: [errorMessage] };
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
        const { rawProducts, logs } = await getWebsiteProducts();
        return { success: true, products: rawProducts, error: null, logs };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { success: false, products: [], error: `Failed to fetch website products: ${errorMessage}`, logs: [errorMessage] };
    }
}


// Dashboard Actions
async function getSalesData(dateRange?: DateRange): Promise<{ totalSales: number, totalRefunds: number, totalTaxes: number }> {
    // In a real app, you would fetch orders from all connected platforms for the given profile.
    // For now, we'll just use Shopify as the source.
    try {
        const { orders } = await getShopifyOrders({ dateRange });
        
        let totalSales = 0;
        let totalRefunds = 0;
        let totalTaxes = 0;

        for (const order of orders) {
            if (order.financial_status === 'refunded' || order.financial_status === 'partially_refunded') {
                totalRefunds += parseFloat(order.total_price);
            } else if (order.financial_status === 'paid' || order.financial_status === 'partially_paid') {
                 totalSales += parseFloat(order.total_price);
            }
            totalTaxes += parseFloat(order.total_tax || '0');
        }

        return { totalSales, totalRefunds, totalTaxes };

    } catch (error) {
        console.error("Failed to fetch sales data:", error);
        return { totalSales: 0, totalRefunds: 0, totalTaxes: 0 };
    }
}

export async function getDashboardStats(dateRange?: DateRange) {
    try {
        const defaultRange: DateRange = { from: subDays(new Date(), 14), to: new Date() };
        const range = dateRange || defaultRange;
    
        const [
            { totalSales, totalRefunds, totalTaxes },
            platformCounts,
            websiteProductCount
        ] = await Promise.all([
            getSalesData(range),
            getPlatformProductCounts(),
            getWebsiteProductCount([])
        ]);

        return {
            success: true,
            stats: {
                totalSales,
                totalRefunds,
                totalTaxes,
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

export async function handleGetOrCreateUser(): Promise<{ success: boolean; user: User | null; profile: Profile | null; agency: Agency | null; error: string | null; }> {
    const supabase = createSupabaseServerClient('MAIN');
    
    // In a real app, this would come from the actual authenticated user session
    // For testing, we use a random Auth0 ID and a fixed email.
    const randomId = Math.random().toString(36).substring(2, 15);
    const mockAuth0Id = `auth0|${randomId}`;
    const mockEmail = `rakshitvaish@amzadscout.com`;
    const mockAgency = { agency_id: 'agency_123', name: 'Mock Agency' };

    try {
        // 1. Check if user exists
        const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select(`*, profiles(*)`)
            .eq('auth0_id', mockAuth0Id)
            .single();

        if (findError && findError.code !== 'PGRST116') { // PGRST116 = no rows found
            throw findError;
        }

        if (existingUser) {
            // User found, return their data
            return {
                success: true,
                user: existingUser as User,
                profile: existingUser.profiles as Profile,
                agency: mockAgency,
                error: null
            };
        }

        // 2. User not found, create them
        const { data: newUser, error: insertUserError } = await supabase
            .from('users')
            .insert({
                auth0_id: mockAuth0Id,
                username: mockEmail,
                role: 'sub',
                status: 'active'
            })
            .select()
            .single();

        if (insertUserError) throw insertUserError;
        if (!newUser) throw new Error('Failed to create user and retrieve their ID.');
        
        // 3. Create their associated profile
        const { data: newProfile, error: insertProfileError } = await supabase
            .from('profiles')
            .insert({
                id: newUser.id, // Match profile PK to user PK
                email: mockEmail
            })
            .select()
            .single();
        
        if (insertProfileError) throw insertProfileError;

        return {
            success: true,
            user: newUser as User,
            profile: newProfile as Profile,
            agency: mockAgency,
            error: null
        };

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Error in handleGetOrCreateUser:', errorMessage);
        return { success: false, user: null, profile: null, agency: null, error: `Database operation failed: ${errorMessage}` };
    }
}

export async function handleGetShopifyProducts() {
  try {
    const { rawProducts, logs } = await getShopifyProducts({});
    return { success: true, products: rawProducts, error: null, logs };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { success: false, products: [], error: `Failed to fetch Shopify products: ${errorMessage}`, logs: [] };
  }
}

export async function handleGetEtsyProducts() {
    try {
        const { products, logs } = await getEtsyProducts();
        return { success: true, products, error: null, logs };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { success: false, products: [], error: `Failed to fetch Etsy products: ${errorMessage}`, logs: [errorMessage] };
    }
}

const settingsFilePath = path.join(process.cwd(), 'src', 'lib', 'settings.json');

export async function handleSaveSettings(settings: AppSettings): Promise<{ success: boolean; error: string | null; }> {
    try {
        // Read existing settings to not overwrite other parts of the file
        const existingSettings = await handleGetSettings();
        const newSettings = { ...existingSettings.settings, ...settings };
        
        const data = JSON.stringify(newSettings, null, 2);
        await fs.writeFile(settingsFilePath, data, 'utf-8');
        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Error saving settings:', errorMessage);
        return { success: false, error: `File system operation failed: ${errorMessage}` };
    }
}

export async function handleGetSettings(): Promise<{ success: boolean; settings: AppSettings | null; error: string | null; }> {
    try {
        const data = await fs.readFile(settingsFilePath, 'utf-8');
        const settings = JSON.parse(data) as AppSettings;
        return { success: true, settings, error: null };
    } catch (e) {
        if (e instanceof Error && 'code' in e && e.code === 'ENOENT') {
            // File doesn't exist, return empty/default settings
             return { success: true, settings: { marketplaces: [], logoUrl: '', faviconUrl: '' }, error: null };
        }
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Error loading settings:', errorMessage);
        return { success: false, settings: null, error: `File system operation failed: ${errorMessage}` };
    }
}

export async function handleFetchAndLinkMarketplaceId(productId: string, sku: string, marketplace: 'amazon' | 'walmart') {
    console.log(`Fetching ID for SKU ${sku} on ${marketplace}`);
    try {
        let marketplaceId: string | null = null;
        if (marketplace === 'amazon') {
            marketplaceId = await getAmazonProductBySku(sku);
        } else if (marketplace === 'walmart') {
            marketplaceId = await getWalmartProductBySku(sku);
        }

        if (marketplaceId) {
            await updateProductMarketplaceId(productId, marketplace, marketplaceId);
            return { success: true, marketplaceId, error: null };
        } else {
            return { success: false, error: `SKU not found on ${marketplace}.` };
        }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error(`Failed to fetch and link for ${sku} on ${marketplace}:`, errorMessage);
        return { success: false, error: errorMessage };
    }
}

export async function handleBulkFetchAndLinkMarketplaceIds(productSkus: { productId: string, sku: string }[], marketplace: 'amazon' | 'walmart'): Promise<{ success: boolean, linkedCount: number, errors: string[] }> {
    console.log(`Bulk fetching IDs for ${productSkus.length} SKUs on ${marketplace}`);
    let linkedCount = 0;
    const errors: string[] = [];

    const lookupFn = marketplace === 'amazon' ? getAmazonProductBySku : getWalmartProductBySku;

    for (const { productId, sku } of productSkus) {
        try {
            const marketplaceId = await lookupFn(sku);
            if (marketplaceId) {
                await updateProductMarketplaceId(productId, marketplace, marketplaceId);
                linkedCount++;
            } else {
                // This case is not an error, just a failed lookup. 
                // We could log it if needed, but it's not an exception.
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? `SKU ${sku}: ${e.message}` : `Unknown error for SKU ${sku}`;
            errors.push(errorMessage);
        }
    }

    if (errors.length > 0) {
        console.error('Errors during bulk link:', errors);
    }

    return { success: true, linkedCount, errors };
}

export async function handleCreateProductOnPlatform(productId: string, platform: string): Promise<{ success: boolean; error: string | null }> {
    console.log(`Received request to create product ${productId} on platform ${platform}`);

    try {
        const product = await getSingleWebsiteProduct(productId);
        if (!product) {
            return { success: false, error: 'Product not found in local database.' };
        }

        console.log(`Creating product "${product.title}" on ${platform}...`);
        
        // This is a placeholder. In a real application, you would call the
        // specific API for each platform to create the product.
        // For example: `createWalmartProduct(product)`, `createEtsyListing(product)`, etc.
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        
        // After successfully creating, you might want to update your local DB
        // to store the new external ID. For now, we just log it.
        const newExternalId = `${platform.toUpperCase()}_${String(product.id).substring(0, 5)}_${Date.now()}`;
        console.log(`Product created on ${platform} with new ID: ${newExternalId}`);

        // Update the database with the new linkage
        await updateProductMarketplaceId(product.admin_graphql_api_id, platform as 'amazon' | 'walmart', newExternalId);

        return { success: true, error: null };

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error(`Failed to create product on ${platform}:`, errorMessage);
        return { success: false, error: errorMessage };
    }
}

export async function handleBulkUpdatePrices(updates: PriceUpdatePayload[]): Promise<{ success: boolean; message: string; updatedCount: number; errorCount: number; }> {
    let updatedCount = 0;
    let errorCount = 0;

    for (const update of updates) {
        try {
            const product = await getSingleWebsiteProduct(update.id);
            if (!product || !product.variants[0]) {
                 errorCount++;
                 continue;
            }
            const variant = product.variants[0];

            // Shopify Price Update
            if (update.shopify_price !== undefined) {
                await updateShopifyProduct({
                    id: update.id, // GID
                    variants: [{ id: variant.id, price: update.shopify_price.toString() }]
                });
                updatedCount++;
            }

            // Amazon Price Update
            if (update.amazon_price !== undefined && variant.sku) {
                await updateAmazonProduct({ sku: variant.sku, price: update.amazon_price });
                updatedCount++;
            }

            // Walmart Price Update
            if (update.walmart_price !== undefined && variant.sku) {
                await updateWalmartProduct({ sku: variant.sku, price: update.walmart_price });
                updatedCount++;
            }
        } catch (e) {
            console.error(`Failed to update price for product ${update.id}:`, e);
            errorCount++;
        }
    }

    if (errorCount > 0 && updatedCount === 0) {
        return { success: false, message: 'All price updates failed.', updatedCount, errorCount };
    }

    return { success: true, message: 'Bulk price update process completed.', updatedCount, errorCount };
}

export async function handleBulkUpdateStock(updates: StockUpdatePayload[]): Promise<{ success: boolean; message: string; updatedCount: number; errorCount: number; }> {
    let updatedCount = 0;
    let errorCount = 0;

    for (const update of updates) {
        try {
            const product = await getSingleWebsiteProduct(update.id);
             if (!product || !product.variants[0]) {
                 errorCount++;
                 continue;
            }
            const variant = product.variants[0];

            // Shopify Stock Update
            if (update.shopify_inventory !== undefined) {
                await updateShopifyProduct({
                    id: update.id, // GID
                    variants: [{ id: variant.id, inventory_quantity: update.shopify_inventory }]
                });
                updatedCount++;
            }

             // Amazon Stock Update
            if (update.amazon_inventory !== undefined && variant.sku) {
                await updateAmazonProduct({ sku: variant.sku, inventory: update.amazon_inventory });
                updatedCount++;
            }

            // Walmart Stock Update
            if (update.walmart_inventory !== undefined && variant.sku) {
                await updateWalmartProduct({ sku: variant.sku, inventory: update.walmart_inventory });
                updatedCount++;
            }

        } catch (e) {
            console.error(`Failed to update stock for product ${update.id}:`, e);
            errorCount++;
        }
    }

    if (errorCount > 0 && updatedCount === 0) {
        return { success: false, message: 'All stock updates failed.', updatedCount, errorCount };
    }

    return { success: true, message: 'Bulk stock update process completed.', updatedCount, errorCount };
}
    



    