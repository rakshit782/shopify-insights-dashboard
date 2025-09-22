
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    Alert,
    AlertDescription,
    AlertTitle
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Terminal } from 'lucide-react';
import type { ShopifyOrder } from '@/lib/types';
import { format } from 'date-fns';

function OrdersSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {Array.from({ length: 6 }).map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}

export function OrdersDashboard() {
    const [orders, setOrders] = useState<ShopifyOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
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
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const getStatusVariant = (status: string | null) => {
        switch (status) {
            case 'fulfilled': return 'default';
            case 'unfulfilled':
            case null:
                return 'secondary';
            case 'partial': return 'outline';
            default: return 'secondary';
        }
    }
    
    const getFinancialStatusVariant = (status: string) => {
        switch(status) {
            case 'paid': return 'default';
            case 'pending': return 'secondary';
            case 'refunded':
            case 'partially_refunded':
                return 'outline';
            case 'voided': return 'destructive';
            default: return 'secondary';
        }
    }

    if (isLoading) {
        return (
          <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-6">Orders</h2>
            <OrdersSkeleton />
          </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-3xl font-bold tracking-tight text-foreground mb-6">Orders</h2>
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Fetching Orders</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-6">Orders</h2>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Payment Status</TableHead>
                                <TableHead>Fulfillment</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.name}</TableCell>
                                    <TableCell>
                                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        {order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {parseFloat(order.total_price).toLocaleString('en-US', { style: 'currency', currency: order.currency })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getFinancialStatusVariant(order.financial_status)}>{order.financial_status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(order.fulfillment_status)}>{order.fulfillment_status || 'unfulfilled'}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
