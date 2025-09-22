
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Terminal } from 'lucide-react';
import type { ShopifyOrder } from '@/lib/types';
import { OrderTable } from './order-table';
import type { DateRange } from 'react-day-picker';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export interface FilteredOrdersResult {
    platform: string;
    orders: ShopifyOrder[];
}

interface OrdersDashboardProps {
  platform: 'Shopify' | 'Amazon' | 'Walmart' | 'eBay' | 'Etsy' | 'Wayfair';
  searchQuery: string;
  dateRange?: DateRange;
  onFilteredOrdersChange: (platform: string, orders: ShopifyOrder[]) => void;
}

function OrdersSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-[400px] w-full" />
        </div>
    )
}

const getCustomerName = (order: ShopifyOrder) => {
    if (order.customer) {
        return `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim();
    }
    if (order.shipping_address) {
        return `${order.shipping_address.first_name || ''} ${order.shipping_address.last_name || ''}`.trim();
    }
    return 'N/A';
};

export function OrdersDashboard({ platform, searchQuery, dateRange, onFilteredOrdersChange }: OrdersDashboardProps) {
    const [orders, setOrders] = useState<ShopifyOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        if (platform !== 'Shopify') {
            setOrders([]);
            setIsLoading(false);
            return;
        }

        try {
            const params = new URLSearchParams();
            if (dateRange?.from) {
                params.append('created_at_min', dateRange.from.toISOString());
            }
            if (dateRange?.to) {
                params.append('created_at_max', dateRange.to.toISOString());
            }

            const response = await fetch(`/api/orders/shopify?${params.toString()}`);
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
    }, [platform, dateRange]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    
    const filteredOrders = useMemo(() => {
        if (!searchQuery) {
            return orders;
        }

        const lowercasedQuery = searchQuery.toLowerCase();
        return orders.filter(order =>
            order.name.toLowerCase().includes(lowercasedQuery) ||
            getCustomerName(order).toLowerCase().includes(lowercasedQuery) ||
            (order.customer?.email || '').toLowerCase().includes(lowercasedQuery)
        );
    }, [orders, searchQuery]);

    useEffect(() => {
        onFilteredOrdersChange(platform, filteredOrders);
    }, [filteredOrders, onFilteredOrdersChange, platform]);


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
    
    if (orders.length > 0 && filteredOrders.length === 0) {
       return (
             <Alert variant="secondary">
                <Terminal className="h-4 w-4" />
                <AlertTitle>No Orders Match Your Filters</AlertTitle>
                <AlertDescription>
                    Try adjusting your search query or date range.
                </AlertDescription>
            </Alert>
       )
    }
    
    if (orders.length === 0 && !isLoading) {
        return (
             <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>No Orders Found</AlertTitle>
                <AlertDescription>
                    There are no orders to display for {platform}. This could be because there are no orders in the selected date range or the connection is not configured.
                </AlertDescription>
            </Alert>
        )
    }

    return <OrderTable orders={filteredOrders} platform={platform} />;
}
