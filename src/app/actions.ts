
'use server';

import { getShopifyProducts, createShopifyProduct, updateShopifyProduct, getShopifyProduct, getCredentialStatuses, getShopifyOrders, getWalmartOrders, getAmazonOrders, getPlatformProductCounts } from '@/lib/shopify-client';
import { syncProductsToWebsite, getWebsiteProducts, getWebsiteProductCount } from '@/lib/website-supabase-client';
import type { ShopifyProductCreation, ShopifyProduct, ShopifyProductUpdate, ShopifyOrder, Agency, User, Profile } from '@/lib/types';
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
    const { orders } = await getShopifyOrders({ dateRange });
    return { success: true, orders, error: null };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { success: false, orders: [], error: `Failed to fetch Shopify orders: ${errorMessage}` };
  }
}

export async function handleGetWalmartOrders(dateRange?: DateRange) {
  try {
    const { orders } = await getWalmartOrders({ dateRange });
    return { success: true, orders, error: null };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { success: false, orders: [], error: `Failed to fetch Walmart orders: ${errorMessage}` };
  }
}

export async function handleGetAmazonOrders(dateRange?: DateRange) {
    try {
        const { orders } = await getAmazonOrders({ dateRange });
        return { success: true, orders, error: null };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { success: false, orders: [], error: `Failed to fetch Amazon orders: ${errorMessage}` };
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
    // In a real app, you would fetch orders from all connected platforms for the given profile.
    // For now, we'll just use Shopify as the source.
    try {
        const { orders } = await getShopifyOrders({ dateRange });
        return orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
    } catch (error) {
        console.error("Failed to fetch sales data:", error);
        return 0;
    }
}

export async function getDashboardStats(dateRange?: DateRange) {
    try {
        const defaultRange: DateRange = { from: subDays(new Date(), 6), to: new Date() };
        const range = dateRange || defaultRange;
    
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

    