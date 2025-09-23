
'use client';

import { useState, useEffect } from 'react';
import { handleGetCredentialStatuses } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, ShoppingCart, Terminal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Button } from './ui/button';
import { ConnectionsDialog } from './connections-dialog';
import { cn } from '@/lib/utils';

interface ChannelStatus {
    id: string;
    name: string;
    icon: React.ReactNode;
    connected: boolean;
    lastSync?: Date;
    errorCount: number;
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
                <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>
                        Last sync: {status.lastSync ? `${formatDistanceToNow(status.lastSync, { addSuffix: true })}` : 'Never'}
                    </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Terminal className="mr-2 h-4 w-4" />
                    <span>
                        {status.errorCount} errors in the last 24 hours
                    </span>
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
    const [statuses, setStatuses] = useState<ChannelStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

    const fetchStatuses = async () => {
        setIsLoading(true);
        setError(null);
        const result = await handleGetCredentialStatuses();
        if (result.success && result.statuses) {
            const fetchedStatuses = Object.entries(result.statuses).map(([key, connected]) => ({
                id: key,
                name: platformMeta[key].name,
                icon: platformMeta[key].icon,
                connected: connected as boolean,
                lastSync: connected ? new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 2) : undefined,
                errorCount: connected ? Math.floor(Math.random() * 5) : 0,
            }));
            setStatuses(fetchedStatuses);
        } else {
            setError(result.error || "Failed to fetch channel statuses.");
        }
        setIsLoading(false);
    }
    
    useEffect(() => {
        fetchStatuses();
    }, []);

    const handleConfigure = (platformId: string) => {
        setSelectedPlatform(platformId);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (credentialsSaved: boolean) => {
        setIsDialogOpen(false);
        setSelectedPlatform(null);
        if (credentialsSaved) {
            // Re-fetch statuses to show updated connection state
            fetchStatuses();
        }
    };


    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Channel Health</h1>
                <p className="text-muted-foreground">Monitor and configure the status of your connected sales channels.</p>
            </div>
            
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Loading Statuses</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent className="space-y-4 pt-6"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-2/3" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {statuses.map(status => (
                        <ChannelHealthCard key={status.id} status={status} onConfigure={handleConfigure} />
                    ))}
                </div>
            )}
            {selectedPlatform && (
                <ConnectionsDialog
                    platform={selectedPlatform}
                    isOpen={isDialogOpen}
                    onClose={handleDialogClose}
                />
            )}
        </div>
    );
}
