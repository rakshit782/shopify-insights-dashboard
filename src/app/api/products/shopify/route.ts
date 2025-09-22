
import { NextResponse } from 'next/server';
import { getShopifyProducts, mapShopifyProducts } from '@/lib/shopify-client';

export const dynamic = 'force-dynamic'; // defaults to auto

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
