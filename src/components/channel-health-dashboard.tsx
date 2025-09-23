
'use client';

import { useState, useEffect } from 'react';
import { handleGetCredentialStatuses, handleGetBusinessProfiles } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Settings } from 'lucide-react';
import Image from 'next/image';
import { Button } from './ui/button';
import { ConnectionsDialog } from './connections-dialog';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BusinessProfile } from '@/lib/types';
import Link from 'next/link';

interface ChannelStatus {
    id: string;
    name: string;
    icon: React.ReactNode;
    connected: boolean;
}

const platformMeta: { [key: string]: { name: string; icon: React.ReactNode } } = {
    'shopify': { name: 'Shopify', icon: <Image src="/shopify.svg" alt="Shopify" width={32} height={32} unoptimized /> },
    'amazon': { name: 'Amazon', icon: <Image src="/amazon.svg" alt="Amazon" width={32} height={32} unoptimized /> },
    'walmart': { name: 'Walmart', icon: <Image src="/walmart.svg" alt="Walmart" width={32} height={32} unoptimized /> },
    'ebay': { name: 'eBay', icon: <Image src="/ebay.svg" alt="eBay" width={32} height={32} unoptimized /> },
    'etsy': { name: 'Etsy', icon: <Image src="/etsy.svg" alt="Etsy" width={32} height={32} unoptimized /> },
    'wayfair': { name: 'Wayfair', icon: <Image src="/wayfair.svg" alt="Wayfair" width={32} height={32} unoptimized /> },
};

function ChannelHealthCard({ status, onConfigure }: { status: ChannelStatus, onConfigure: (platformId: string) => void; }) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-3">
                    {status.icon}
                    {status.name}
                </CardTitle>
                <div className={`flex items-center gap-2 text-sm`}>
                    <span className={cn("h-2 w-2 rounded-full", status.connected ? "bg-green-500" : "bg-red-500")} />
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4 pt-6">
                <div className="text-sm text-muted-foreground">
                    {status.connected ? 'Connection is active.' : 'Not connected.'}
                </div>
            </CardContent>
            <CardFooter>
                 <Button 
                    variant={status.connected ? "outline" : "default"} 
                    className="w-full"
                    onClick={() => onConfigure(status.id)}
                 >
                    {status.connected ? 'Configure' : 'Connect'}
                </Button>
            </CardFooter>
        </Card>
    );
}

export function ChannelHealthDashboard() {
    const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
    const [statuses, setStatuses] = useState<ChannelStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

    const fetchProfiles = async () => {
        setIsLoading(true);
        setError(null);
        const profileResult = await handleGetBusinessProfiles();
        if (profileResult.success && profileResult.profiles.length > 0) {
            setProfiles(profileResult.profiles);
            const initialProfileId = profileResult.profiles[0].id;
            setSelectedProfileId(initialProfileId);
            fetchStatuses(initialProfileId);
        } else {
            setProfiles([]);
            setIsLoading(false);
            if(profileResult.error) setError(profileResult.error);
        }
    };
    
    const fetchStatuses = async (profileId: string) => {
        setIsLoading(true);
        setError(null);
        const result = await handleGetCredentialStatuses(profileId);
        if (result.success && result.statuses) {
            const fetchedStatuses = Object.entries(result.statuses).map(([key, connected]) => ({
                id: key,
                name: platformMeta[key]?.name || key,
                icon: platformMeta[key]?.icon,
                connected: connected as boolean,
            })).filter(s => s.name); // Filter out any platforms not in meta
            setStatuses(fetchedStatuses);
        } else {
            setError(result.error || "Failed to fetch channel statuses.");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const handleProfileChange = (profileId: string) => {
        setSelectedProfileId(profileId);
        fetchStatuses(profileId);
    };

    const handleConfigure = (platformId: string) => {
        setSelectedPlatform(platformId);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (credentialsSaved: boolean) => {
        setIsDialogOpen(false);
        setSelectedPlatform(null);
        if (credentialsSaved && selectedProfileId) {
            fetchStatuses(selectedProfileId);
        }
    };

    const NoProfilesState = () => (
        <Card className="col-span-full flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
            <CardTitle>No Business Profiles Found</CardTitle>
            <CardDescription className="mt-2 max-w-md">
                You need to create a business profile before you can manage channel connections.
            </CardDescription>
            <Button asChild className="mt-4">
                <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" /> Go to Settings
                </Link>
            </Button>
        </Card>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Channel Health</h1>
                    <p className="text-muted-foreground">Monitor and configure connections for your business profiles.</p>
                </div>
                {profiles.length > 0 && (
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
                )}
            </div>
            
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-4 w-3/4" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
                    ))
                ) : profiles.length === 0 && !isLoading ? (
                    <NoProfilesState />
                ) : (
                    statuses.map(status => (
                        <ChannelHealthCard key={status.id} status={status} onConfigure={handleConfigure} />
                    ))
                )}
            </div>

            {selectedPlatform && selectedProfileId && (
                <ConnectionsDialog
                    profileId={selectedProfileId}
                    platform={selectedPlatform}
                    isOpen={isDialogOpen}
                    onClose={handleDialogClose}
                />
            )}
        </div>
    );
}

