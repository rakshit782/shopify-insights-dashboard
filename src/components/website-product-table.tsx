
'use client';

import { useState } from 'react';
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
import { Database, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ShopifyProduct } from '@/lib/types';
import { PaginationControls } from './pagination-controls';

const PRODUCTS_PER_PAGE = 10;

export function WebsiteProductTable({ products }: { products: ShopifyProduct[] }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const currentProducts = products.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'outline';
    }
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
                Displaying {Math.min(PRODUCTS_PER_PAGE, products.length)} of {products.length} products from your database.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell>{product.product_type}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(product.status)}>{product.status}</Badge>
                  </TableCell>
                   <TableCell>
                     {formatDistanceToNow(new Date(product.updated_at), { addSuffix: true })}
                   </TableCell>
                  <TableCell>
                    {/* In a real app, this would link to the product on the live website */}
                    <Button asChild variant="outline" size="sm">
                       <Link href={`#`} target="_blank" rel="noopener noreferrer">
                         View <ExternalLink className="ml-2 h-3 w-3" />
                       </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <PaginationControls
         currentPage={currentPage}
         totalPages={totalPages}
         onPageChange={setCurrentPage}
         className="mt-4"
      />
    </>
  );
}
