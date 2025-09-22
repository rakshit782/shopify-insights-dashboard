
'use client';

import { useState, useEffect } from 'react';
import { handleGetCredentialStatuses } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, ShoppingCart, Terminal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Button } from './ui/button';
import Link from 'next/link';

interface ChannelStatus {
    name: string;
    icon: React.ReactNode;
    connected: boolean;
    lastSync?: Date;
    errorCount: number;
}

const platformMeta: { [key: string]: { name: string; icon: React.ReactNode } } = {
    'shopify': { name: 'Shopify', icon: <ShoppingCart className="h-8 w-8 text-green-500" /> },
    'amazon': { name: 'Amazon', icon: <Image src="/amazon.svg" alt="Amazon" width={32} height={32} unoptimized /> },
    'walmart': { name: 'Walmart', icon: <Image src="/walmart.svg" alt="Walmart" width={32} height={32} unoptimized /> },
    'ebay': { name: 'eBay', icon: <Image src="/ebay.svg" alt="eBay" width={32} height={32} unoptimized /> },
    'etsy': { name: 'Etsy', icon: <Image src="/etsy.svg" alt="Etsy" width={32} height={32} unoptimized /> },
    'wayfair': { name: 'Wayfair', icon: <Image src="/wayfair.svg" alt="Wayfair" width={32} height={32} unoptimized /> },
};


function ChannelHealthCard({ status }: { status: ChannelStatus }) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-3">
                    {status.icon}
                    {status.name}
                </CardTitle>
                <div className={`flex items-center gap-2 text-sm ${status.connected ? 'text-green-600' : 'text-red-600'}`}>
                    {status.connected ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    <span>{status.connected ? 'Connected' : 'Disconnected'}</span>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
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
            <div className="p-6 pt-0">
                <Button asChild variant="outline" className="w-full">
                    <Link href="/connections">
                        Manage Connection
                    </Link>
                </Button>
            </div>
        </Card>
    );
}

export function ChannelHealthDashboard() {
    const [statuses, setStatuses] = useState<ChannelStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStatuses() {
            setIsLoading(true);
            setError(null);
            const result = await handleGetCredentialStatuses();
            if (result.success && result.statuses) {
                const fetchedStatuses = Object.entries(result.statuses).map(([key, connected]) => ({
                    name: platformMeta[key].name,
                    icon: platformMeta[key].icon,
                    connected: connected as boolean,
                    // Mock data for now
                    lastSync: connected ? new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 2) : undefined,
                    errorCount: connected ? Math.floor(Math.random() * 5) : 0,
                }));
                setStatuses(fetchedStatuses);
            } else {
                setError(result.error || "Failed to fetch channel statuses.");
            }
            setIsLoading(false);
        }
        fetchStatuses();
    }, []);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Channel Health</h1>
                <p className="text-muted-foreground">Monitor the status of your connected sales channels.</p>
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
                        <Card key={i}><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-2/3" /></CardContent><div className="p-6 pt-0"><Skeleton className="h-10 w-full" /></div></Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {statuses.map(status => (
                        <ChannelHealthCard key={status.name} status={status} />
                    ))}
                </div>
            )}
        </div>
    );
}
