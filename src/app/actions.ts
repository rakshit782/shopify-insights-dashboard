

'use server';

import { getShopifyProducts, createShopifyProduct, updateShopifyProduct, getShopifyProduct, getCredentialStatuses, getShopifyOrders, getWalmartOrders, getAmazonOrders, getPlatformProductCounts, getEtsyProducts, updateEtsyProduct, updateWalmartProduct } from '@/lib/shopify-client';
import { syncProductsToWebsite, getWebsiteProducts, getWebsiteProductCount, getSingleWebsiteProduct } from '@/lib/website-supabase-client';
import type { ShopifyProductCreation, ShopifyProduct, ShopifyProductUpdate, ShopifyOrder, Agency, User, Profile, SyncSettings } from '@/lib/types';
import { optimizeListing, type OptimizeListingInput } from '@/ai/flows/optimize-listing-flow';
import { optimizeContent, type OptimizeContentInput } from '@/ai/flows/optimize-content-flow';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { createSupabaseServerClient } from '@/lib/supabase/server';


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
    const settingsResult = await handleGetSyncSettings();
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

export async function handleSaveSyncSettings(settings: SyncSettings): Promise<{ success: boolean; error: string | null; }> {
    const supabase = createSupabaseServerClient('MAIN');
    const userResult = await handleGetOrCreateUser(); // This gives us a consistent user/profile to work with
    if (!userResult.success || !userResult.profile) {
        return { success: false, error: 'Could not identify user profile to save settings.' };
    }

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ sync_settings: settings })
            .eq('id', userResult.profile.id);

        if (error) throw error;

        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Error saving sync settings:', errorMessage);
        return { success: false, error: `Database operation failed: ${errorMessage}` };
    }
}

export async function handleGetSyncSettings(): Promise<{ success: boolean; settings: SyncSettings | null; error: string | null; }> {
    const supabase = createSupabaseServerClient('MAIN');
    const userResult = await handleGetOrCreateUser();
    if (!userResult.success || !userResult.profile) {
        return { success: false, settings: null, error: 'Could not identify user profile to load settings.' };
    }
    
    // The profile is already fetched in handleGetOrCreateUser, but let's re-fetch to be safe
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('sync_settings')
            .eq('id', userResult.profile.id)
            .single();

        if (error) throw error;

        return { success: true, settings: profile.sync_settings as SyncSettings | null, error: null };

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Error loading sync settings:', errorMessage);
        return { success: false, settings: null, error: `Database operation failed: ${errorMessage}` };
    }
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
        const newExternalId = `${platform.toUpperCase()}_${product.id.substring(0, 5)}_${Date.now()}`;
        console.log(`Product created on ${platform} with new ID: ${newExternalId}`);

        return { success: true, error: null };

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error(`Failed to create product on ${platform}:`, errorMessage);
        return { success: false, error: errorMessage };
    }
}
