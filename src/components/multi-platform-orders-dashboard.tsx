
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ShoppingCart, Settings, Code } from 'lucide-react';
import Image from 'next/image';
import { handleGetCredentialStatuses, handleGetShopifyOrders, handleGetWalmartOrders, handleGetAmazonOrders } from '@/app/actions';
import type { ShopifyOrder } from '@/lib/types';
import { OrderTable } from './order-table';
import { Button } from './ui/button';
import Link from 'next/link';
import { DateRangePicker } from './date-range-picker';
import type { DateRange } from 'react-day-picker';
import { ScrollArea } from './ui/scroll-area';

type OrderFetcher = (dateRange?: DateRange) => Promise<{ success: boolean; orders: ShopifyOrder[]; error: string | null; logs: string[] }>;

type CachedOrders = {
    data: ShopifyOrder[];
    timestamp: number;
    error: string | null;
    logs: string[];
};

const platformMeta: { 
  [key: string]: { 
    name: string; 
    icon: React.ReactNode;
    fetcher: OrderFetcher;
  } 
} = {
    'shopify': { 
        name: 'Shopify', 
        icon: <Image src="/shopify.svg" alt="Shopify" width={18} height={18} unoptimized />,
        fetcher: (dateRange) => handleGetShopifyOrders(dateRange)
    },
    'walmart': { 
        name: 'Walmart', 
        icon: <Image src="/walmart.svg" alt="Walmart" width={18} height={18} unoptimized />,
        fetcher: (dateRange) => handleGetWalmartOrders(dateRange)
    },
    'amazon': { 
        name: 'Amazon', 
        icon: <Image src="/amazon.svg" alt="Amazon" width={18} height={18} unoptimized />,
        fetcher: (dateRange) => handleGetAmazonOrders(dateRange)
    },
    'ebay': { 
        name: 'eBay', 
        icon: <Image src="/ebay.svg" alt="eBay" width={18} height={18} unoptimized />,
        fetcher: async () => ({ success: true, orders: [], error: null, logs: ['eBay not implemented.'] }) // Placeholder
    },
    'etsy': { 
        name: 'Etsy', 
        icon: <Image src="/etsy.svg" alt="Etsy" width={18} height={18} unoptimized />,
        fetcher: async () => ({ success: true, orders: [], error: null, logs: ['Etsy not implemented.'] }) // Placeholder
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

function DebugLog({ logs }: { logs: string[] }) {
    if (logs.length === 0) return null;
    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Code className="h-5 w-5" />
                    API Call Logs
                </CardTitle>
                <CardDescription>
                    This is a log of the API calls made to fetch the order data. Use this for debugging purposes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[200px] w-full">
                    <div className="font-mono text-xs text-muted-foreground bg-slate-900/50 dark:bg-slate-800/50 p-4 rounded-md">
                        {logs.map((log, index) => (
                            <p key={index} className="whitespace-pre-wrap break-all border-b border-slate-700/50 py-1">
                                {`[${index + 1}] ${log}`}
                            </p>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}


function PlatformOrderView({ platformId, dateRange, cache, setCache }: { platformId: string, dateRange?: DateRange, cache: Record<string, CachedOrders>, setCache: Function }) {
    const [isLoading, setIsLoading] = useState(true);
    
    const platform = platformMeta[platformId];
    const cachedEntry = cache[platformId];
    const orders = cachedEntry?.data || [];
    const error = cachedEntry?.error || null;
    const logs = cachedEntry?.logs || [];
    const isCacheValid = cachedEntry && (Date.now() - cachedEntry.timestamp < 1000 * 60 * 120); // 2 hours

    useEffect(() => {
        async function fetchOrders() {
            if (isCacheValid) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            const result = await platform.fetcher(dateRange);
            setCache((prev: Record<string, CachedOrders>) => ({
                ...prev,
                [platformId]: {
                    data: result.orders,
                    timestamp: Date.now(),
                    error: result.error,
                    logs: result.logs || [],
                }
            }));
            setIsLoading(false);
        }
        fetchOrders();
    }, [platform.fetcher, dateRange, platformId, setCache, isCacheValid]);

    if (isLoading && !isCacheValid) return <OrdersLoadingSkeleton />;
    
    if (error) return (
        <>
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Failed to load orders</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            <DebugLog logs={logs} />
        </>
    );
    
    if (orders.length === 0) {
       return (
            <>
                <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[40vh]">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                    <CardTitle>No Orders Found</CardTitle>
                    <CardDescription className="mt-2 max-w-md">
                        There are no orders to display for this marketplace in the selected date range.
                    </CardDescription>
                </Card>
                 <DebugLog logs={logs} />
            </>
        );
    }

    return (
        <>
            <OrderTable orders={orders} platform={platformId} />
            <DebugLog logs={logs} />
        </>
    );
}

export function MultiPlatformOrdersDashboard() {
    const [connectedChannels, setConnectedChannels] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [orderCache, setOrderCache] = useState<Record<string, CachedOrders>>({});

    const fetchStatuses = useCallback(async () => {
        setIsLoading(true);
        const statusResult = await handleGetCredentialStatuses();
        if (statusResult.success) {
            const connected = Object.keys(statusResult.statuses).filter(key => statusResult.statuses[key] && platformMeta[key]);
            setConnectedChannels(connected);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchStatuses();
    }, [fetchStatuses]);
    
    const handleDateUpdate = useCallback((range?: DateRange) => {
        setDateRange(range);
        // Invalidate cache when date range changes
        setOrderCache({});
    }, []);

    const defaultTab = useMemo(() => connectedChannels[0] || '', [connectedChannels]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

    if (connectedChannels.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[40vh]">
                 <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                 <CardTitle>No Marketplaces Connected</CardTitle>
                 <CardDescription className="mt-2 max-w-md">
                    Please add credentials for at least one marketplace (e.g., Shopify, Walmart) in your .env file to start viewing orders.
                 </CardDescription>
            </Card>
        );
    }
    
    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <DateRangePicker onUpdate={handleDateUpdate} />
            </div>
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
                        <PlatformOrderView platformId={id} dateRange={dateRange} cache={orderCache} setCache={setOrderCache} />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
