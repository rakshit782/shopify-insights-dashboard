
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ShoppingCart, Info } from 'lucide-react';
import Image from 'next/image';
import { handleGetCredentialStatuses, handleGetShopifyOrders, handleGetWalmartOrders } from '@/app/actions';
import type { ShopifyOrder } from '@/lib/types';
import { OrderTable } from './order-table';

const platformMeta: { 
  [key: string]: { 
    name: string; 
    icon: React.ReactNode;
    fetcher: () => Promise<{ success: boolean; orders: ShopifyOrder[]; error: string | null; }>;
  } 
} = {
    'shopify': { 
        name: 'Shopify', 
        icon: <Image src="/shopify.svg" alt="Shopify" width={18} height={18} unoptimized />,
        fetcher: handleGetShopifyOrders
    },
    'walmart': { 
        name: 'Walmart', 
        icon: <Image src="/walmart.svg" alt="Walmart" width={18} height={18} unoptimized />,
        fetcher: handleGetWalmartOrders
    },
    'amazon': { 
        name: 'Amazon', 
        icon: <Image src="/amazon.svg" alt="Amazon" width={18} height={18} unoptimized />,
        fetcher: async () => ({ success: true, orders: [], error: null }) // Placeholder
    },
    'ebay': { 
        name: 'eBay', 
        icon: <Image src="/ebay.svg" alt="eBay" width={18} height={18} unoptimized />,
        fetcher: async () => ({ success: true, orders: [], error: null }) // Placeholder
    },
    'etsy': { 
        name: 'Etsy', 
        icon: <Image src="/etsy.svg" alt="Etsy" width={18} height={18} unoptimized />,
        fetcher: async () => ({ success: true, orders: [], error: null }) // Placeholder
    },
};

function OrdersLoadingSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-9 w-28" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

function PlatformOrderView({ platformId }: { platformId: string }) {
    const [orders, setOrders] = useState<ShopifyOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const platform = platformMeta[platformId];

    useEffect(() => {
        async function fetchOrders() {
            setIsLoading(true);
            setError(null);
            const result = await platform.fetcher();
            if (result.success) {
                setOrders(result.orders);
            } else {
                setError(result.error);
            }
            setIsLoading(false);
        }
        fetchOrders();
    }, [platform.fetcher]);

    if (isLoading) return <OrdersLoadingSkeleton />;
    if (error) return (
        <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Failed to load orders</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );

    return <OrderTable orders={orders} platform={platformId} />;
}


export function MultiPlatformOrdersDashboard() {
    const [connectedChannels, setConnectedChannels] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStatuses() {
            setIsLoading(true);
            const result = await handleGetCredentialStatuses();
            if (result.success && result.statuses) {
                const connected = Object.keys(result.statuses).filter(key => result.statuses![key] && platformMeta[key]);
                setConnectedChannels(connected);
            }
            setIsLoading(false);
        }
        fetchStatuses();
    }, []);

    const defaultTab = useMemo(() => connectedChannels[0] || '', [connectedChannels]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

    if (connectedChannels.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[40vh]">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle>No Connected Marketplaces</CardTitle>
                <CardDescription className="mt-2 max-w-md">
                    Please connect at least one marketplace (e.g., Shopify, Walmart) on the Channel Health page to start viewing your orders.
                </CardDescription>
            </Card>
        );
    }
    
    return (
        <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList>
                 {connectedChannels.map(id => (
                    <TabsTrigger key={id} value={id}>
                       <div className="flex items-center gap-2">
                         {platformMeta[id].icon}
                         {platformMeta[id].name}
                       </div>
                    </TabsTrigger>
                ))}
            </TabsList>
            {connectedChannels.map(id => (
                <TabsContent key={id} value={id}>
                    <PlatformOrderView platformId={id} />
                </TabsContent>
            ))}
        </Tabs>
    );
}
