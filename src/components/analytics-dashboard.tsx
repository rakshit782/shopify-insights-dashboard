
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProductCount {
    source: string;
    count: number;
}

export function AnalyticsDashboard() {
    const [productCounts, setProductCounts] = useState<ProductCount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const [shopifyRes, websiteRes] = await Promise.all([
                    fetch('/api/products/shopify'),
                    fetch('/api/products/website'),
                ]);

                if (!shopifyRes.ok || !websiteRes.ok) {
                    throw new Error('Failed to fetch product data from one or more sources.');
                }

                const shopifyData = await shopifyRes.json();
                const websiteData = await websiteRes.json();

                const counts: ProductCount[] = [
                    { source: 'Shopify', count: shopifyData.products?.length || 0 },
                    { source: 'Website DB', count: websiteData.products?.length || 0 },
                    { source: 'Amazon', count: 0 },
                    { source: 'Walmart', count: 0 },
                    { source: 'eBay', count: 0 },
                    { source: 'Etsy', count: 0 },
                    { source: 'Wayfair', count: 0 },
                ];

                setProductCounts(counts);

            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    const renderProductCountChart = () => {
        if (isLoading) {
             return <Skeleton className="h-80 w-full" />;
        }
        if (error) {
            return null; // Error is handled globally below
        }

        return (
             <Card>
                <CardHeader>
                    <CardTitle>Product Count by Platform</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={productCounts} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="source" />
                            <YAxis allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="count" fill="hsl(var(--primary))" name="Number of Products" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground/80 mb-6">
                Analytics Overview
            </h2>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Loading Analytics</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-8">
                {renderProductCountChart()}

                <Card>
                    <CardHeader>
                        <CardTitle>Sales Analytics</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                        <p>Sales data from external platforms will be shown here.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Marketing Analytics</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                        <p>Data from Google Analytics (GA4) will be shown here.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
