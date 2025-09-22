
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
  onFilteredOrdersChange: (orders: ShopifyOrder[]) => void;
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
    
    const filteredOrders = useMemo(() => {
        let filtered = orders;

        // Apply date range filter
        if (dateRange?.from) {
            const toDate = dateRange.to || dateRange.from;
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.created_at);
                // Use startOfDay and endOfDay to ensure the entire day is included
                return isWithinInterval(orderDate, { start: startOfDay(dateRange.from!), end: endOfDay(toDate) });
            });
        }
        
        // Apply search query filter
        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(order =>
                order.name.toLowerCase().includes(lowercasedQuery) ||
                getCustomerName(order).toLowerCase().includes(lowercasedQuery) ||
                (order.customer?.email || '').toLowerCase().includes(lowercasedQuery)
            );
        }

        return filtered;
    }, [orders, searchQuery, dateRange]);

    useEffect(() => {
        onFilteredOrdersChange(filteredOrders);
    }, [filteredOrders, onFilteredOrdersChange]);


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
                    There are no orders to display for {platform}.
                </AlertDescription>
            </Alert>
        )
    }

    return <OrderTable orders={filteredOrders} platform={platform} />;
}
