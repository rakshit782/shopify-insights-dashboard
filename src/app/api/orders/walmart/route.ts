
import { NextResponse } from 'next/server';
import { getWalmartOrders } from '@/lib/shopify-client';
import { type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const createdStartDate = searchParams.get('createdStartDate');
    const limit = searchParams.get('limit') || '100';

    const { orders, logs } = await getWalmartOrders({
        createdStartDate: createdStartDate || undefined,
        limit,
    });
    
    return NextResponse.json({ orders, logs });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('API Error fetching Walmart orders:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
