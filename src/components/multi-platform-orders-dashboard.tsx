
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ShoppingCart, Settings } from 'lucide-react';
import Image from 'next/image';
import { handleGetCredentialStatuses, handleGetShopifyOrders, handleGetWalmartOrders, handleGetBusinessProfiles } from '@/app/actions';
import type { ShopifyOrder, BusinessProfile } from '@/lib/types';
import { OrderTable } from './order-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from './ui/button';
import Link from 'next/link';

type OrderFetcher = (profileId: string) => Promise<{ success: boolean; orders: ShopifyOrder[]; error: string | null; }>;

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
        fetcher: (profileId) => handleGetShopifyOrders(profileId)
    },
    'walmart': { 
        name: 'Walmart', 
        icon: <Image src="/walmart.svg" alt="Walmart" width={18} height={18} unoptimized />,
        fetcher: (profileId) => handleGetWalmartOrders(profileId)
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

function PlatformOrderView({ profileId, platformId }: { profileId: string, platformId: string }) {
    const [orders, setOrders] = useState<ShopifyOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const platform = platformMeta[platformId];

    useEffect(() => {
        async function fetchOrders() {
            setIsLoading(true);
            setError(null);
            const result = await platform.fetcher(profileId);
            if (result.success) {
                setOrders(result.orders);
            } else {
                setError(result.error);
            }
            setIsLoading(false);
        }
        fetchOrders();
    }, [platform.fetcher, profileId]);

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
    const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
    const [connectedChannels, setConnectedChannels] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfilesAndStatuses = useCallback(async () => {
        setIsLoading(true);
        const profileResult = await handleGetBusinessProfiles();
        if (profileResult.success && profileResult.profiles.length > 0) {
            const initialProfile = profileResult.profiles[0];
            setProfiles(profileResult.profiles);
            setSelectedProfileId(initialProfile.id);
            const connected = Object.keys(initialProfile.credential_statuses || {}).filter(key => initialProfile.credential_statuses![key] && platformMeta[key]);
            setConnectedChannels(connected);
        } else {
            setProfiles([]);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchProfilesAndStatuses();
    }, [fetchProfilesAndStatuses]);

    const handleProfileChange = (profileId: string) => {
        setSelectedProfileId(profileId);
        const profile = profiles.find(p => p.id === profileId);
        if (profile) {
            const connected = Object.keys(profile.credential_statuses || {}).filter(key => profile.credential_statuses![key] && platformMeta[key]);
            setConnectedChannels(connected);
        }
    };

    const defaultTab = useMemo(() => connectedChannels[0] || '', [connectedChannels]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

    if (profiles.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[40vh]">
                 <CardTitle>No Business Profiles Found</CardTitle>
                <CardDescription className="mt-2 max-w-md">
                    You need to create a business profile before you can view orders.
                </CardDescription>
                <Button asChild className="mt-4">
                    <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" /> Go to Settings
                    </Link>
                </Button>
            </Card>
        );
    }
    
    return (
        <div className="space-y-4">
            <Select value={selectedProfileId || ''} onValueChange={handleProfileChange}>
                <SelectTrigger className="w-full sm:w-64">
                    <SelectValue placeholder="Select a profile" />
                </SelectTrigger>
                <SelectContent>
                    {profiles.map(profile => (
                        <SelectItem key={profile.id} value={profile.id}>
                            {profile.profile_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {connectedChannels.length > 0 && selectedProfileId ? (
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
                            <PlatformOrderView profileId={selectedProfileId} platformId={id} />
                        </TabsContent>
                    ))}
                </Tabs>
            ) : (
                 <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[40vh]">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                    <CardTitle>No Connected Marketplaces</CardTitle>
                    <CardDescription className="mt-2 max-w-md">
                        Please connect at least one marketplace (e.g., Shopify, Walmart) in this profile's settings to start viewing orders.
                    </CardDescription>
                </Card>
            )}
        </div>
    );
}

    