
import { NextResponse } from 'next/server';
import { getShopifyProducts, getPlatformProductCounts, type PlatformProductCount } from '@/lib/shopify-client';
import { getWebsiteProducts } from '@/lib/website-supabase-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs: string[] = [];
    const allCounts: PlatformProductCount[] = [];
    const requiredPlatforms = ['Shopify', 'Website DB', 'Amazon', 'Walmart', 'eBay', 'Etsy', 'Wayfair'];

    // Initialize all platforms with 0
    const platformCountMap = new Map<string, number>();
    requiredPlatforms.forEach(p => platformCountMap.set(p, 0));

    // Fetch counts from Shopify, Website DB, and other external platforms concurrently
    const [shopifyResult, websiteResult, externalCountsResult] = await Promise.allSettled([
      getShopifyProducts({ countOnly: true }),
      getWebsiteProducts(),
      getPlatformProductCounts(logs),
    ]);

    // Process Shopify results
    if (shopifyResult.status === 'fulfilled' && shopifyResult.value.count !== undefined) {
      platformCountMap.set('Shopify', shopifyResult.value.count);
      logs.push(...shopifyResult.value.logs);
    } else if (shopifyResult.status === 'rejected') {
      console.error('Shopify API Error:', shopifyResult.reason);
      logs.push(`Shopify API Error: ${shopifyResult.reason instanceof Error ? shopifyResult.reason.message : String(shopifyResult.reason)}`);
    }

    // Process Website DB results
    if (websiteResult.status === 'fulfilled') {
      platformCountMap.set('Website DB', websiteResult.value.rawProducts.length);
       logs.push(...websiteResult.value.logs);
    } else if (websiteResult.status === 'rejected') {
      console.error('Website DB Error:', websiteResult.reason);
       logs.push(`Website DB Error: ${websiteResult.reason instanceof Error ? websiteResult.reason.message : String(websiteResult.reason)}`);
    }
    
    // Process other external platform counts
    if (externalCountsResult.status === 'fulfilled') {
        externalCountsResult.value.forEach(extCount => {
            if (platformCountMap.has(extCount.platform)) {
                platformCountMap.set(extCount.platform, extCount.count);
            }
        });
    } else if (externalCountsResult.status === 'rejected') {
         console.error('External Platform Counts Error:', externalCountsResult.reason);
         logs.push(`External Platform Counts Error: ${externalCountsResult.reason instanceof Error ? externalCountsResult.reason.message : String(externalCountsResult.reason)}`);
    }

    // Convert map back to array in the desired order
    requiredPlatforms.forEach(platform => {
      allCounts.push({ platform, count: platformCountMap.get(platform) || 0 });
    });

    return NextResponse.json({ counts: allCounts, logs });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('API Error in product-counts:', error);
    return NextResponse.json({ error: errorMessage, counts: [], logs: [errorMessage] }, { status: 500 });
  }
}
