
'use client';

import { useState, useEffect } from 'react';
import type { Competitor } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ExternalLink, DollarSign, RefreshCw, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from './ui/badge';
import { handleFetchCompetitors } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

function CompetitorSkeleton() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Skeleton className="h-8 w-64 mb-1" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-10 w-48" />
            </div>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-48" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-5 w-20" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}

export function CompetitorsDashboard() {
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/competitors');
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to fetch competitor data.');
            }
            const data = await res.json();
            setCompetitors(data.competitors || []);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onFetchNewCompetitors = async () => {
        setIsFetching(true);
        const result = await handleFetchCompetitors();
        setIsFetching(false);

        if (result.success) {
            toast({
                title: "Scraping Complete",
                description: `Successfully fetched ${result.count} new competitor products.`,
            });
            fetchData(); // Refresh the data grid
        } else {
            toast({
                title: "Scraping Failed",
                description: result.error,
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return <CompetitorSkeleton />;
    }

    if (error) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Loading Competitors</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Competitor Product Analysis</h1>
                    <p className="text-muted-foreground">
                        An overview of competitor products scraped from various sources.
                    </p>
                </div>
                <Button onClick={onFetchNewCompetitors} disabled={isFetching}>
                    {isFetching ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Fetch New Competitors
                </Button>
            </div>

            {competitors.length === 0 ? (
                 <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>No Competitor Data Found</AlertTitle>
                    <AlertDescription>
                        Your `brand_competitors` table in Supabase might be empty. Click "Fetch New Competitors" to start scraping data from Amazon.
                    </AlertDescription>
                </Alert>
            ) : (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Competitor</TableHead>
                                <TableHead>Product Title</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Last Fetched</TableHead>
                                <TableHead className="text-right">Link</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {competitors.map((competitor) => (
                                <TableRow key={competitor.id}>
                                    <TableCell className="font-medium">{competitor.competitor_brand}</TableCell>
                                    <TableCell>{competitor.product_title}</TableCell>
                                    <TableCell className="flex items-center">
                                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                                        {competitor.price.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{competitor.source}</Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(competitor.fetched_at), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="ghost" size="icon">
                                            <a href={competitor.url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    );
}
