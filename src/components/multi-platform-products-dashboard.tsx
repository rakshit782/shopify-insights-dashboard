
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Shirt, Code, RefreshCw, UploadCloud, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { handleGetCredentialStatuses, handleGetShopifyProducts, handleGetEtsyProducts, handleSyncProducts } from '@/app/actions';
import type { ShopifyProduct } from '@/lib/types';
import { ProductTable } from './product-table';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

type ProductFetcher = () => Promise<{ success: boolean; products: ShopifyProduct[]; error: string | null; logs: string[] }>;

type CachedProducts = {
    data: ShopifyProduct[];
    timestamp: number;
    error: string | null;
    logs: string[];
};

const platformMeta: { 
  [key: string]: { 
    name: string; 
    icon: React.ReactNode;
    fetcher: ProductFetcher;
    showPushToDb?: boolean;
  } 
} = {
    'shopify': { 
        name: 'Shopify', 
        icon: <Image src="/shopify.svg" alt="Shopify" width={18} height={18} unoptimized />,
        fetcher: handleGetShopifyProducts,
        showPushToDb: true,
    },
    'etsy': { 
        name: 'Etsy', 
        icon: <Image src="/etsy.svg" alt="Etsy" width={18} height={18} unoptimized />,
        fetcher: handleGetEtsyProducts
    },
};

function ProductsLoadingSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-28" />
                    </div>
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
                    This is a log of the API calls made to fetch the product data. Use this for debugging purposes.
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

function PlatformProductView({ platformId, cache, setCache }: { platformId: string, cache: Record<string, CachedProducts>, setCache: Function }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isPushingToDb, setIsPushingToDb] = useState(false);
    const { toast } = useToast();
    
    const platform = platformMeta[platformId];
    const cachedEntry = cache[platformId];
    const products = cachedEntry?.data || [];
    const error = cachedEntry?.error || null;
    const logs = cachedEntry?.logs || [];
    const isCacheValid = cachedEntry && (Date.now() - cachedEntry.timestamp < 1000 * 60 * 60 * 5); // 5 hours cache

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        const result = await platform.fetcher();
        setCache((prev: Record<string, CachedProducts>) => ({
            ...prev,
            [platformId]: {
                data: result.products,
                timestamp: Date.now(),
                error: result.error,
                logs: result.logs || [],
            }
        }));
        setIsLoading(false);
    }, [platform.fetcher, platformId, setCache]);
    

    const handlePushToDb = async () => {
        setIsPushingToDb(true);
        toast({
            title: "Syncing to Database...",
            description: "Fetching latest Shopify products and pushing them to your Supabase instance."
        });

        const result = await handleSyncProducts();

        if (result.success) {
            toast({
                title: "Sync Successful",
                description: `${result.count} products have been successfully synced to the database.`
            });
        } else {
            toast({
                title: "Sync Failed",
                description: result.error,
                variant: "destructive"
            });
        }
        setIsPushingToDb(false);
    }

    if (isLoading) return <ProductsLoadingSkeleton />;
    
    if (error) return (
        <>
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Failed to load products</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            <DebugLog logs={logs} />
        </>
    );
    
    if (products.length === 0) {
       return (
            <>
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Products</CardTitle>
                             <div className="flex items-center gap-2">
                                {platform.showPushToDb && (
                                    <Button variant="outline" size="sm" onClick={handlePushToDb} disabled={isPushingToDb}>
                                        {isPushingToDb ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                        Push to DB
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => fetchProducts()} disabled={isLoading}>
                                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center p-8 min-h-[40vh]">
                        <Shirt className="h-12 w-12 text-muted-foreground mb-4" />
                        <CardTitle>No Products Found</CardTitle>
                        <CardDescription className="mt-2 max-w-md">
                            Click 'Refresh' to fetch product data from this marketplace.
                        </CardDescription>
                    </CardContent>
                </Card>
                 <DebugLog logs={logs} />
            </>
        );
    }

    return (
        <>
            <ProductTable 
                products={products} 
                platform={platformId} 
                onRefresh={() => fetchProducts()}
                isLoading={isLoading}
                onPushToDb={platform.showPushToDb ? handlePushToDb : undefined}
                isPushingToDb={isPushingToDb}
            />
            <DebugLog logs={logs} />
        </>
    );
}

export function MultiPlatformProductsDashboard() {
    const [connectedChannels, setConnectedChannels] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [productCache, setProductCache] = useState<Record<string, CachedProducts>>({});

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
                 <Shirt className="h-12 w-12 text-muted-foreground mb-4" />
                 <CardTitle>No Marketplaces Connected</CardTitle>
                 <CardDescription className="mt-2 max-w-md">
                    Please add credentials for at least one marketplace (e.g., Shopify, Walmart) in your .env file to start viewing products.
                 </CardDescription>
            </Card>
        );
    }
    
    return (
        <div className="space-y-4">
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
                        <PlatformProductView platformId={id} cache={productCache} setCache={setProductCache} />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
