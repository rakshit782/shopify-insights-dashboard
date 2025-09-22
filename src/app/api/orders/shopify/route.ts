
import { NextResponse } from 'next/server';
import { getShopifyOrders } from '@/lib/shopify-client';
import { type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const createdAtMin = searchParams.get('created_at_min')
    const createdAtMax = searchParams.get('created_at_max')

    const { orders, logs } = await getShopifyOrders({ 
        createdAtMin: createdAtMin || undefined,
        createdAtMax: createdAtMax || undefined,
    });
    return NextResponse.json({ orders, logs });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('API Error fetching orders:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
