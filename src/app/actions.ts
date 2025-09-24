
'use server';

import { getShopifyProducts, createShopifyProduct, updateShopifyProduct, getShopifyProduct, saveShopifyCredentials, saveAmazonCredentials, saveWalmartCredentials, saveEbayCredentials, saveEtsyCredentials, saveWayfairCredentials, getCredentialStatuses, getShopifyOrders, getWalmartOrders, getPlatformProductCounts } from '@/lib/shopify-client';
import { syncProductsToWebsite, getWebsiteProducts, getWebsiteProductCount } from '@/lib/website-supabase-client';
import type { ShopifyProductCreation, ShopifyProduct, ShopifyProductUpdate, AmazonCredentials, WalmartCredentials, EbayCredentials, EtsyCredentials, WayfairCredentials, ShopifyOrder, BusinessProfile, BusinessProfileCreation, Agency } from '@/lib/types';
import { optimizeListing, type OptimizeListingInput } from '@/ai/flows/optimize-listing-flow';
import { optimizeContent, type OptimizeContentInput } from '@/ai/flows/optimize-content-flow';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { createSupabaseServerClient } from '@/lib/supabase/server';


export async function handleSyncProducts(profileId: string) {
  try {
    // We now get the rawProducts array from the API response
    const { rawProducts } = await getShopifyProducts({ profileId });
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

export async function handleCreateProduct(profileId: string, productData: ShopifyProductCreation) {
  try {
    // Create product in Shopify
    const { product: newShopifyProduct } = await createShopifyProduct(profileId, productData);
    
    // Sync the newly created product to our website's Supabase
    await syncProductsToWebsite([newShopifyProduct]);

    return { success: true, error: null, product: newShopifyProduct };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Product creation failed:', errorMessage);
    return { success: false, error: `Failed to create product: ${errorMessage}` };
  }
}

export async function handleUpdateProduct(profileId: string, productData: ShopifyProductUpdate) {
  try {
    // Update product in Shopify
    const { product: updatedShopifyProduct } = await updateShopifyProduct(profileId, productData);

    // Re-sync the updated product to our website's Supabase
    await syncProductsToWebsite([updatedShopifyProduct]);

    return { success: true, error: null, product: updatedShopifyProduct };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Product update failed:', errorMessage);
    return { success: false, error: `Failed to update product: ${errorMessage}` };
  }
}

export async function handleGetProduct(profileId: string, id: number) {
  try {
    const { product } = await getShopifyProduct(profileId, id);
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

export async function handleGetCredentialStatuses(profileId: string): Promise<{ success: boolean; statuses: Record<string, boolean>; error: string | null; }> {
    try {
        const statuses = await getCredentialStatuses(profileId);
        return { success: true, statuses, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to get credential statuses:', errorMessage);
        return { success: false, statuses: {}, error: `Failed to get statuses: ${errorMessage}` };
    }
}

export async function handleSaveShopifyCredentials(profileId: string, storeName: string, accessToken: string) {
    try {
        await saveShopifyCredentials(profileId, storeName, accessToken);
        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to save Shopify credentials:', errorMessage);
        return { success: false, error: `Failed to save credentials: ${errorMessage}` };
    }
}

export async function handleSaveAmazonCredentials(profileId: string, credentials: AmazonCredentials) {
    try {
        await saveAmazonCredentials(profileId, credentials);
        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to save Amazon credentials:', errorMessage);
        return { success: false, error: `Failed to save credentials: ${errorMessage}` };
    }
}

export async function handleSaveWalmartCredentials(profileId: string, credentials: WalmartCredentials) {
    try {
        await saveWalmartCredentials(profileId, credentials);
        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to save Walmart credentials:', errorMessage);
        return { success: false, error: `Failed to save credentials: ${errorMessage}` };
    }
}

export async function handleSaveEbayCredentials(profileId: string, credentials: EbayCredentials) {
    try {
        await saveEbayCredentials(profileId, credentials);
        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to save eBay credentials:', errorMessage);
        return { success: false, error: `Failed to save credentials: ${errorMessage}` };
    }
}

export async function handleSaveEtsyCredentials(profileId: string, credentials: EtsyCredentials) {
    try {
        await saveEtsyCredentials(profileId, credentials);
        return { success: true, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Failed to save Etsy credentials:', errorMessage);
        return { success: false, error: `Failed to save credentials: ${errorMessage}` };
    }
}

export async function handleSaveWayfairCredentials(profileId: string, credentials: WayfairCredentials) {
    try {
        await saveWayfairCredentials(profileId, credentials);
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

export async function handleGetShopifyOrders(profileId: string, dateRange?: DateRange) {
  try {
    const { orders } = await getShopifyOrders({ profileId, dateRange });
    return { success: true, orders, error: null };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { success: false, orders: [], error: `Failed to fetch Shopify orders: ${errorMessage}` };
  }
}

export async function handleGetWalmartOrders(profileId: string) {
  try {
    const { orders } = await getWalmartOrders(profileId);
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
async function getSalesData(profileId: string | null, dateRange?: DateRange): Promise<number> {
    if (!profileId) return 0;
    // In a real app, you would fetch orders from all connected platforms for the given profile.
    // For now, we'll just use Shopify as the source.
    try {
        const { orders } = await getShopifyOrders({ profileId, dateRange });
        return orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
    } catch (error) {
        console.error("Failed to fetch sales data:", error);
        return 0;
    }
}

export async function getDashboardStats(profileId: string | null, dateRange?: DateRange) {
    try {
        const defaultRange: DateRange = { from: subDays(new Date(), 6), to: new Date() };
        const range = dateRange || defaultRange;

        if (!profileId) {
            return {
                success: true,
                stats: { totalSales: 0, platformCounts: [], websiteProductCount: 0 },
                error: null,
            };
        }
    
        const [
            totalSales,
            platformCounts,
            websiteProductCount
        ] = await Promise.all([
            getSalesData(profileId, range),
            getPlatformProductCounts(profileId, []),
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

// Settings Actions
export async function handleSaveBusinessProfile(profileData: BusinessProfileCreation): Promise<{ success: boolean, profile: BusinessProfile | null, error: string | null }> {
    const supabase = createSupabaseServerClient('MAIN');
    try {
        const { id, ...dataToUpsert } = profileData;
        let result;
        if (id) {
            // Update existing profile
            result = await supabase.from('business_profiles').update(dataToUpsert).eq('id', id).select().single();
        } else {
            // Create new profile
            result = await supabase.from('business_profiles').insert(dataToUpsert).select().single();
        }

        if (result.error) throw result.error;

        return { success: true, profile: result.data, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { success: false, profile: null, error: `Failed to save profile: ${errorMessage}` };
    }
}

export async function handleGetBusinessProfiles(): Promise<{ success: boolean, profiles: BusinessProfile[], error: string | null }> {
    try {
        const supabase = createSupabaseServerClient('MAIN');
        const { data: profiles, error } = await supabase.from('business_profiles').select('*');
        if (error) throw error;
        
        // For each profile, fetch the credential statuses
        const profilesWithStatuses = await Promise.all(
            (profiles || []).map(async (profile) => {
                const { statuses } = await handleGetCredentialStatuses(profile.id);
                return { ...profile, credential_statuses: statuses };
            })
        );
        
        return { success: true, profiles: profilesWithStatuses, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Error in handleGetBusinessProfiles:', errorMessage);
        return { success: false, profiles: [], error: errorMessage };
    }
}

export async function handleGetUserAgency(): Promise<{ success: boolean; email: string | null; agency: Agency | null; error: string | null; }> {
    // This is now a mock function since user auth is removed
    return { success: true, email: 'rvaishjpr@gmail.com', agency: { agency_id: 'agency_123', name: 'Mock Agency' }, error: null };
}
    
    

    

    


    