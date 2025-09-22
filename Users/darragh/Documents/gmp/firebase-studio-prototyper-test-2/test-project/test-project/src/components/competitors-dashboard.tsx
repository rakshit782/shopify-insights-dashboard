
'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ExternalLink, DollarSign, Sheet, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from './ui/badge';
import { getCompetitorsFromSheet } from '@/app/actions';

interface CompetitorData {
    id: string;
    competitor_brand: string;
    product_title: string;
    price: number;
    url: string;
}

function CompetitorSkeleton() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Skeleton className="h-8 w-64 mb-1" />
                    <Skeleton className="h-4 w-96" />
                </div>
            </div>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-48" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-5 w-20" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
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
    const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        const result = await getCompetitorsFromSheet();
        if (result.success) {
            setCompetitors(result.data || []);
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
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
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Competitor Product Analysis</h1>
                    <p className="text-muted-foreground">
                        An overview of competitor products fetched from your Google Sheet.
                    </p>
                </div>
            </div>

            {competitors.length === 0 ? (
                 <Alert>
                    <Sheet className="h-4 w-4" />
                    <AlertTitle>No Competitor Data Found</AlertTitle>
                    <AlertDescription>
                        Your Google Sheet might be empty or not configured correctly. Please ensure the sheet is named 'Sheet1' and has the headers: 'Brand', 'Product', 'Price', 'URL'.
                    </AlertDescription>
                </Alert>
            ) : (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Competitor Brand</TableHead>
                                <TableHead>Product Title</TableHead>
                                <TableHead>Price</TableHead>
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
                                    <TableCell className="text-right">
                                        {competitor.url && (
                                            <Button asChild variant="ghost" size="icon">
                                                <a href={competitor.url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
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
