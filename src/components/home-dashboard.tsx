
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardStats } from '@/app/actions';
import type { PlatformProductCount } from '@/lib/shopify-client';
import { DateRangePicker } from './date-range-picker';
import { DateRange } from 'react-day-picker';
import { DollarSign, List, Database, RefreshCw, Landmark } from 'lucide-react';
import Image from 'next/image';

interface DashboardStats {
    totalSales: number;
    totalRefunds: number;
    totalTaxes: number;
    platformCounts: PlatformProductCount[];
    websiteProductCount: number;
}

const platformIconMap: { [key: string]: string } = {
    Shopify: '/shopify.svg',
    Amazon: '/amazon.svg',
    Walmart: '/walmart.svg',
    eBay: '/ebay.svg',
    Etsy: '/etsy.svg',
    Wayfair: '/wayfair.svg',
};

function StatCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-7 w-7" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </CardContent>
        </Card>
    );
}

export function HomeDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    
    const fetchStats = useCallback(async (range?: DateRange) => {
        setIsLoading(true);
        const result = await getDashboardStats(range);
        if (result && result.success && result.stats) {
            setStats(result.stats);
        } else {
            console.error(result?.error);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchStats(dateRange);
    }, [dateRange, fetchStats]);


    const handleDateUpdate = useCallback((range?: DateRange) => {
        setDateRange(range);
    }, []);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                <div>
                     <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Your central hub for e-commerce operations.
                    </p>
                </div>
                 <div className="flex flex-col sm:flex-row gap-2">
                    <DateRangePicker onUpdate={handleDateUpdate} />
                </div>
            </div>

            {isLoading && !stats ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-3/4" /> :
                                <div className="text-2xl font-bold">
                                    {formatCurrency(stats?.totalSales || 0)}
                                </div>
                            }
                            <p className="text-xs text-muted-foreground">
                                Gross sales for the selected period
                            </p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Refunds</CardTitle>
                            <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-3/4" /> :
                                <div className="text-2xl font-bold">
                                    {formatCurrency(stats?.totalRefunds || 0)}
                                </div>
                            }
                            <p className="text-xs text-muted-foreground">
                                Total value of refunded orders
                            </p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Taxes Collected</CardTitle>
                            <Landmark className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-3/4" /> :
                                <div className="text-2xl font-bold">
                                    {formatCurrency(stats?.totalTaxes || 0)}
                                </div>
                            }
                            <p className="text-xs text-muted-foreground">
                                Total sales tax collected
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                            <List className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             {isLoading ? <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div> :
                                <div className="space-y-2">
                                    {stats?.platformCounts.filter(p => p.count > 0).map(platform => (
                                        <div key={platform.platform} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <Image src={platformIconMap[platform.platform]} alt={platform.platform} width={16} height={16} unoptimized />
                                                <span className="text-muted-foreground">{platform.platform}</span>
                                            </div>
                                            <span className="font-semibold">{platform.count.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    {stats?.platformCounts.length === 0 && (
                                        <p className="text-xs text-muted-foreground">No marketplaces connected.</p>
                                    )}
                                </div>
                             }
                        </CardContent>
                    </Card>
                   
                </div>
            )}
        </div>
    );
}
