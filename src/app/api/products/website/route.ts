
import { NextResponse } from 'next/server';
import { getWebsiteProducts } from '@/lib/website-supabase-client';
import { mapShopifyProducts } from '@/lib/shopify-client';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const { rawProducts, logs } = await getWebsiteProducts();
    const mappedProducts = mapShopifyProducts(rawProducts);
    return NextResponse.json({ products: mappedProducts, logs });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('API Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

