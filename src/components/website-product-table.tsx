
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Database, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ShopifyProduct } from '@/lib/types';
import { PaginationControls } from './pagination-controls';
import { handleGetCredentialStatuses } from '@/app/actions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const platformIconMap: { [key: string]: string } = {
    shopify: '/shopify.svg',
    amazon: '/amazon.svg',
    walmart: '/walmart.svg',
    ebay: '/ebay.svg',
    etsy: '/etsy.svg',
    wayfair: '/wayfair.svg',
};

export function WebsiteProductTable({ products }: { products: ShopifyProduct[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(10);
  const [connectedChannels, setConnectedChannels] = useState<string[]>([]);
  
  useEffect(() => {
    async function fetchStatuses() {
      const result = await handleGetCredentialStatuses();
      if (result.success && result.statuses) {
        const connected = Object.keys(result.statuses).filter(key => result.statuses![key]);
        setConnectedChannels(connected);
      }
    }
    fetchStatuses();
  }, []);

  const totalPages = Math.ceil(products.length / productsPerPage);
  const currentProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'outline';
    }
  };

  const handlePageSizeChange = (value: string) => {
      setProductsPerPage(Number(value));
      setCurrentPage(1); // Reset to first page
  };

  if (products.length === 0) {
    return (
       <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[40vh]">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>No Products Found in Database</CardTitle>
            <CardDescription className="mt-2 max-w-md">
                Your product database is empty. Sync products from a connected channel or create a new one in the Cataloging Manager.
            </CardDescription>
        </Card>
    );
  }

  return (
    <>
      <Card>
         <CardHeader>
            <CardTitle>Synced Products</CardTitle>
            <CardDescription>
                Showing {Math.min(productsPerPage, currentProducts.length)} of {products.length} products from your database.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sync Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                       <Image
                          src={product.image?.src || 'https://placehold.co/400'}
                          alt={product.title}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                       />
                    </TableCell>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>{product.vendor}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(product.status)}>{product.status}</Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            {Object.keys(platformIconMap).map(channel => {
                                const isConnected = connectedChannels.includes(channel);
                                // MOCK DATA: In a real app, you'd check the product's sync status for each channel
                                const isSynced = channel === 'shopify' && isConnected; 
                                if (!isConnected) return null; // Only show icons for connected channels
                                return (
                                    <Tooltip key={channel}>
                                        <TooltipTrigger>
                                            <div className="relative">
                                                <Image src={platformIconMap[channel]} alt={channel} width={20} height={20} className="rounded-sm" />
                                                {isSynced ? (
                                                    <CheckCircle className="absolute -bottom-1 -right-1 h-3 w-3 bg-background text-green-500 rounded-full" />
                                                ) : (
                                                    <XCircle className="absolute -bottom-1 -right-1 h-3 w-3 bg-background text-destructive rounded-full" />
                                                )}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{channel.charAt(0).toUpperCase() + channel.slice(1)}: {isSynced ? 'Synced' : 'Not Synced'}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            })}
                        </div>
                    </TableCell>
                     <TableCell>
                       {formatDistanceToNow(new Date(product.updated_at), { addSuffix: true })}
                     </TableCell>
                    <TableCell>
                      {/* In a real app, this would link to the product on the live website */}
                       <Button asChild variant="outline" size="sm">
                         <Link href={`/products/${product.id}/edit`}>
                           Edit
                         </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>
        </CardContent>
      </Card>
      <PaginationControls
         currentPage={currentPage}
         totalPages={totalPages}
         onPageChange={setCurrentPage}
         pageSize={productsPerPage}
         onPageSizeChange={handlePageSizeChange}
         className="mt-4"
      />
    </>
  );
}
