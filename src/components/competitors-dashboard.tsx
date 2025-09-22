
'use client';

import { useState, useEffect } from 'react';
import type { Competitor } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

function CompetitorSkeleton() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Skeleton className="h-8 w-1/3 mb-6" />
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-48" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-5 w-20" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
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
        }

        fetchData();
    }, []);

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

    if (competitors.length === 0) {
        return (
            <div className="p-8">
                <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>No Competitor Data Found</AlertTitle>
                    <AlertDescription>
                        Your `competitors` table in Supabase might be empty. Once your scraper runs, the data will appear here.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Competitor Analysis</h1>
            <p className="text-muted-foreground mb-8">
                An overview of competitor data scraped from the web.
            </p>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Competitor</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Strengths</TableHead>
                            <TableHead>Weaknesses</TableHead>
                            <TableHead>Last Scraped</TableHead>
                            <TableHead className="text-right">Website</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {competitors.map((competitor) => (
                            <TableRow key={competitor.id}>
                                <TableCell className="font-medium">{competitor.name}</TableCell>
                                <TableCell>{competitor.category}</TableCell>
                                <TableCell className="text-sm text-green-600">{competitor.strengths || 'N/A'}</TableCell>
                                <TableCell className="text-sm text-red-600">{competitor.weaknesses || 'N/A'}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(competitor.last_scraped_at), { addSuffix: true })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="ghost" size="icon">
                                        <a href={competitor.website} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
