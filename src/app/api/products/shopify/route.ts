
import { NextResponse } from 'next/server';
import { getShopifyProducts, mapShopifyProducts } from '@/lib/shopify-client';

export const revalidate = 18000; // Cache for 5 hours

export async function GET() {
  try {
    const { rawProducts, logs } = await getShopifyProducts();
    const mappedProducts = mapShopifyProducts(rawProducts);
    return NextResponse.json({ products: mappedProducts, logs });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('API Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
