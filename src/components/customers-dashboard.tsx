
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Users, Search } from 'lucide-react';
import Image from 'next/image';
import { handleGetShopifyOrders, handleGetWalmartOrders, handleGetAmazonOrders } from '@/app/actions';
import type { ShopifyOrder } from '@/lib/types';
import { PaginationControls } from './pagination-controls';
import { Input } from './ui/input';

interface UnifiedCustomer {
    email: string;
    name: string;
    platforms: string[];
}

const platformIconMap: { [key: string]: string } = {
    shopify: '/shopify.svg',
    amazon: '/amazon.svg',
    walmart: '/walmart.svg',
    ebay: '/ebay.svg',
    etsy: '/etsy.svg',
};

function CustomersLoadingSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-9 w-1/4 mt-2" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function CustomersDashboard() {
    const [customers, setCustomers] = useState<UnifiedCustomer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [customersPerPage, setCustomersPerPage] = useState(10);

    const fetchCustomers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [shopifyResult, walmartResult, amazonResult] = await Promise.all([
                handleGetShopifyOrders(),
                handleGetWalmartOrders(),
                handleGetAmazonOrders(),
            ]);

            const customerMap = new Map<string, UnifiedCustomer>();

            const processOrders = (orders: ShopifyOrder[], platform: string) => {
                orders.forEach(order => {
                    const email = order.customer?.email?.toLowerCase();
                    if (!email) return;

                    const name = `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim();
                    
                    if (customerMap.has(email)) {
                        const existing = customerMap.get(email)!;
                        if (!existing.platforms.includes(platform)) {
                            existing.platforms.push(platform);
                        }
                    } else {
                        customerMap.set(email, { email, name: name || 'N/A', platforms: [platform] });
                    }
                });
            };

            if (shopifyResult.success) processOrders(shopifyResult.orders, 'shopify');
            if (walmartResult.success) processOrders(walmartResult.orders, 'walmart');
            if (amazonResult.success) processOrders(amazonResult.orders, 'amazon');

            setCustomers(Array.from(customerMap.values()));

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to fetch customer data: ${errorMessage}`);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const filteredCustomers = useMemo(() => {
        return customers.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customers, searchTerm]);

    const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);
    const currentCustomers = filteredCustomers.slice(
        (currentPage - 1) * customersPerPage,
        currentPage * customersPerPage
    );

    const handlePageSizeChange = (value: string) => {
        setCustomersPerPage(Number(value));
        setCurrentPage(1);
    };

    if (isLoading) {
        return <CustomersLoadingSkeleton />;
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Customers</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                     <div>
                        <CardTitle>All Customers</CardTitle>
                        <CardDescription>
                            A consolidated list of customers from your connected channels. Found {customers.length} unique customers.
                        </CardDescription>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-full sm:w-64"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {filteredCustomers.length > 0 ? (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Channels</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentCustomers.map(customer => (
                                    <TableRow key={customer.email}>
                                        <TableCell className="font-medium">{customer.name}</TableCell>
                                        <TableCell>{customer.email}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {customer.platforms.map(p => (
                                                    <Image key={p} src={platformIconMap[p]} alt={p} width={18} height={18} unoptimized title={p} />
                                                ))}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            pageSize={customersPerPage}
                            onPageSizeChange={handlePageSizeChange}
                            className="mt-4"
                        />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[40vh]">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <CardTitle>No Customers Found</CardTitle>
                        <CardDescription className="mt-2 max-w-md">
                            No customers could be found in your connected marketplaces, or your search returned no results.
                        </CardDescription>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
