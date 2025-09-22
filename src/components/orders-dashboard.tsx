
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Terminal } from 'lucide-react';
import type { ShopifyOrder } from '@/lib/types';
import { OrderTable } from './order-table';

interface OrdersDashboardProps {
  platform: 'Shopify' | 'Amazon' | 'Walmart' | 'eBay' | 'Etsy' | 'Wayfair';
}

function OrdersSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-[400px] w-full" />
        </div>
    )
}

export function OrdersDashboard({ platform }: OrdersDashboardProps) {
    const [orders, setOrders] = useState<ShopifyOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        // For now, we only fetch from Shopify. Others are placeholders.
        if (platform !== 'Shopify') {
            setOrders([]);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/orders/shopify');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch orders.');
            }
            const data = await response.json();
            setOrders(data.orders);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [platform]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);


    if (isLoading) {
        return <OrdersSkeleton />;
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Fetching {platform} Orders</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }
    
    if (orders.length === 0) {
        return (
             <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>No Orders Found</AlertTitle>
                <AlertDescription>
                    There are no orders to display for {platform}.
                </AlertDescription>
            </Alert>
        )
    }

    return <OrderTable orders={orders} platform={platform} />;
}
