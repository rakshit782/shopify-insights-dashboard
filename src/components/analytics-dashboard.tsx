
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ShoppingCart, Database, Box, Store, ShoppingBag, Truck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductCount {
    platform: string;
    count: number;
}

const platformIcons: { [key: string]: React.ElementType } = {
    'Shopify': ShoppingCart,
    'Website DB': Database,
    'Amazon': Box,
    'Walmart': Store,
    'eBay': ShoppingBag,
    'Etsy': ShoppingBag,
    'Wayfair': Truck,
};

const platformOrder = ['Shopify', 'Website DB', 'Amazon', 'Walmart', 'eBay', 'Etsy', 'Wayfair'];

export function AnalyticsDashboard() {
    const [productCounts, setProductCounts] = useState<ProductCount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/analytics/product-counts');

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to fetch product counts.');
                }

                const data: { counts: ProductCount[], logs: string[] } = await res.json();
                
                // The API now returns data in the correct order with fallbacks.
                setProductCounts(data.counts);

            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    const renderProductCountCards = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {platformOrder.map((platform) => (
                         <Card key={platform}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-6 w-6 rounded-sm" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-10 w-1/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }
        if (error) {
            return null; // Error is handled globally below
        }

        return (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {productCounts.map(({ platform, count }) => {
                    const Icon = platformIcons[platform] || Box;
                    return (
                        <Card key={platform} className="transition-all hover:shadow-md hover:-translate-y-1">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium">{platform}</CardTitle>
                                <Icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {count.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">Total Products</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">
                Analytics Dashboard
            </h2>
            <p className="text-muted-foreground mb-8">An overview of your e-commerce ecosystem.</p>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Loading Analytics</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground/90 mb-4">Product Inventory</h3>
                    {renderProductCountCards()}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center h-80 text-muted-foreground">
                            <p>Sales data from external platforms will be shown here.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Marketing Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center h-80 text-muted-foreground">
                            <p>Data from Google Analytics (GA4) will be shown here.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
