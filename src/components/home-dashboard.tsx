
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardStats, handleGetBusinessProfiles } from '@/app/actions';
import type { PlatformProductCount } from '@/lib/shopify-client';
import { DateRangePicker } from './date-range-picker';
import { DateRange } from 'react-day-picker';
import { DollarSign, List, Database, Settings } from 'lucide-react';
import Image from 'next/image';
import type { BusinessProfile } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import Link from 'next/link';

interface DashboardStats {
    totalSales: number;
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
    const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    const fetchProfiles = useCallback(async () => {
        setIsLoading(true);
        const result = await handleGetBusinessProfiles();
        if (result && result.success && result.profiles.length > 0) {
            setProfiles(result.profiles);
            setSelectedProfileId(result.profiles[0].id);
        } else {
            setProfiles([]);
            setIsLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);


    const fetchStats = useCallback(async (profileId: string | null, range?: DateRange) => {
        setIsLoading(true);
        const result = await getDashboardStats(profileId, range);
        if (result && result.success && result.stats) {
            setStats(result.stats);
        } else {
            console.error(result?.error);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        // We only fetch stats if a profile is selected to avoid unnecessary calls.
        if (selectedProfileId) {
            fetchStats(selectedProfileId, dateRange);
        }
    }, [dateRange, selectedProfileId, fetchStats]);


    const handleDateUpdate = useCallback((range?: DateRange) => {
        setDateRange(range);
    }, []);

    const NoProfilesState = () => (
        <Card className="col-span-full flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
            <CardTitle>Welcome to Shopify Insights</CardTitle>
            <CardDescription className="mt-2 max-w-md">
                To get started, create a business profile. This will let you connect your marketplace accounts and see your data.
            </CardDescription>
            <Button asChild className="mt-4">
                <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" /> Go to Settings
                </Link>
            </Button>
        </Card>
    );

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
                    {profiles.length > 0 && (
                        <Select value={selectedProfileId || ''} onValueChange={setSelectedProfileId}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Select Profile" />
                            </SelectTrigger>
                            <SelectContent>
                                {profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.profile_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                    <DateRangePicker onUpdate={handleDateUpdate} />
                </div>
            </div>

            {isLoading && !stats ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>
            ) : !selectedProfileId ? (
                 <NoProfilesState />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-3/4" /> :
                                <div className="text-2xl font-bold">
                                    ${stats?.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                </div>
                            }
                            <p className="text-xs text-muted-foreground">
                                For the selected profile and period
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
                                </div>
                             }
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Product Database</CardTitle>
                             <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             {isLoading ? <Skeleton className="h-8 w-1/2" /> :
                                <div className="text-2xl font-bold">
                                    {stats?.websiteProductCount.toLocaleString() || '0'}
                                </div>
                             }
                            <p className="text-xs text-muted-foreground">
                                Total unique products in catalog
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
