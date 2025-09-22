
import { NextResponse } from 'next/server';
import { getShopifyOrders } from '@/lib/shopify-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { orders, logs } = await getShopifyOrders();
    return NextResponse.json({ orders, logs });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('API Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
