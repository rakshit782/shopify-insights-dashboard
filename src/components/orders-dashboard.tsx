
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Terminal, Settings } from 'lucide-react';
import type { ShopifyOrder } from '@/lib/types';
import { OrderTable } from './order-table';
import type { DateRange } from 'react-day-picker';
import { PaginationControls } from './pagination-controls';
import { Button } from './ui/button';
import Link from 'next/link';

export interface FilteredOrdersResult {
    platform: string;
    orders: ShopifyOrder[];
}

interface OrdersDashboardProps {
  platform: 'Shopify' | 'Amazon' | 'Walmart' | 'eBay' | 'Etsy' | 'Wayfair';
  isConnected: boolean;
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

export function OrdersDashboard({ platform, isConnected, searchQuery, dateRange, onFilteredOrdersChange }: OrdersDashboardProps) {
    const [orders, setOrders] = useState<ShopifyOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchOrders = useCallback(async () => {
        if (!isConnected) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        setCurrentPage(1); // Reset page on new fetch
        
        // Currently, we only fetch from Shopify.
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
    }, [platform, dateRange, isConnected]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    
    const filteredOrders = useMemo(() => {
        let results = orders;
        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            results = orders.filter(order =>
                order.name.toLowerCase().includes(lowercasedQuery) ||
                getCustomerName(order).toLowerCase().includes(lowercasedQuery) ||
                (order.customer?.email || '').toLowerCase().includes(lowercasedQuery)
            );
        }
        return results;
    }, [orders, searchQuery]);

    const { paginatedData, totalPages } = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = filteredOrders.slice(startIndex, endIndex);
        const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
        return { paginatedData, totalPages };
    }, [filteredOrders, currentPage, itemsPerPage]);

    const handleItemsPerPageChange = (value: number) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };

    useEffect(() => {
        onFilteredOrdersChange(platform, filteredOrders);
    }, [platform, filteredOrders, onFilteredOrdersChange]);


    if (!isConnected) {
        return (
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>{platform} is Not Connected</AlertTitle>
                <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2">
                    <p>Please connect your {platform} account to view orders.</p>
                    <Button asChild variant="outline" size="sm" className="mt-4 sm:mt-0">
                        <Link href="/connections">
                            <Settings className="mr-2 h-4 w-4" />
                            Go to Connections
                        </Link>
                    </Button>
                </AlertDescription>
            </Alert>
        )
    }

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
                    There are no orders to display for {platform}. This could be because there are no orders in the selected date range or the connection is not configured correctly.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <>
            <OrderTable orders={paginatedData} platform={platform} />
            {totalPages > 1 && (
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    totalItems={filteredOrders.length}
                />
            )}
        </>
    );
}
