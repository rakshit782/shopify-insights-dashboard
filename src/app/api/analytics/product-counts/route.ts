
import { NextResponse } from 'next/server';
import { getShopifyProducts, getPlatformProductCounts, type PlatformProductCount } from '@/lib/shopify-client';
import { getWebsiteProducts } from '@/lib/website-supabase-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs: string[] = [];
    const allCounts: PlatformProductCount[] = [];

    // Fetch counts from Shopify and Website DB concurrently
    const [shopifyResult, websiteResult, externalCountsResult] = await Promise.allSettled([
      getShopifyProducts({ countOnly: true }),
      getWebsiteProducts(),
      getPlatformProductCounts(logs),
    ]);

    if (shopifyResult.status === 'fulfilled' && shopifyResult.value.count !== undefined) {
      allCounts.push({ platform: 'Shopify', count: shopifyResult.value.count });
    } else {
      if (shopifyResult.status === 'rejected') {
        console.error('Shopify API Error:', shopifyResult.reason);
      }
      // Ensure a placeholder is added on failure so the frontend doesn't break
      allCounts.push({ platform: 'Shopify', count: 0 });
    }

    if (websiteResult.status === 'fulfilled') {
      allCounts.push({ platform: 'Website DB', count: websiteResult.value.rawProducts.length });
    } else {
      console.error('Website DB Error:', websiteResult.reason);
      allCounts.push({ platform: 'Website DB', count: 0 });
    }
    
    if (externalCountsResult.status === 'fulfilled') {
        // We need to merge these with any existing placeholders if necessary
        const existingPlatforms = new Set(allCounts.map(c => c.platform));
        externalCountsResult.value.forEach(extCount => {
            if (!existingPlatforms.has(extCount.platform)) {
                allCounts.push(extCount);
            }
        });
    } else {
         console.error('External Platform Counts Error:', externalCountsResult.reason);
    }
    
    // Ensure all requested platforms are present, even if their fetch failed or they have no data
    const requiredPlatforms = ['Amazon', 'Walmart', 'eBay', 'Etsy', 'Wayfair'];
    requiredPlatforms.forEach(p => {
        if (!allCounts.some(c => c.platform === p)) {
            allCounts.push({ platform: p, count: 0 });
        }
    })

    return NextResponse.json({ counts: allCounts, logs });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('API Error in product-counts:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

    