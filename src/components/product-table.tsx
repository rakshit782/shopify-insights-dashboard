
'use client';

import { useState, useMemo } from 'react';
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
import { MoreHorizontal, RefreshCw, UploadCloud, Loader2, Link2, CircleDot, ArrowUpDown, Filter } from 'lucide-react';
import type { ShopifyProduct } from '@/lib/types';
import { PaginationControls } from './pagination-controls';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const platformIcons: { [key: string]: string } = {
  shopify: '/shopify.svg',
  amazon: '/amazon.svg',
  walmart: '/walmart.svg',
  etsy: '/etsy.svg',
  ebay: '/ebay.svg',
};


const StatusIndicator = ({ isConnected, platform, onConnect }: { isConnected: boolean; platform: string; onConnect: () => void; }) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center justify-center">
                        {isConnected ? (
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        ) : (
                           <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onConnect}>
                             <div className="h-2.5 w-2.5 rounded-full bg-red-500 hover:ring-2 hover:ring-red-300 transition-all" />
                           </Button>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{platform}: {isConnected ? 'Connected' : 'Click to push product'}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};


export function ProductTable({ 
    products, 
    platform,
    connectedChannels,
    onRefresh, 
    isLoading,
    onPushToDb,
    isPushingToDb,
    onProductCreate,
}: { 
    products: ShopifyProduct[], 
    platform: string, 
    connectedChannels: string[],
    onRefresh: () => void, 
    isLoading: boolean,
    onPushToDb?: () => void,
    isPushingToDb?: boolean,
    onProductCreate: (productId: string, platform: string) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ShopifyProduct | 'price' | 'inventory'; direction: 'ascending' | 'descending' } | null>(null);
  const [filters, setFilters] = useState({
      status: 'all',
      amazon: 'all',
      walmart: 'all'
  });

  const sortedAndFilteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filtering
    if (filters.status !== 'all') {
        filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters.amazon !== 'all') {
        filtered = filtered.filter(p => filters.amazon === 'yes' ? !!p.amazon_asin : !p.amazon_asin);
    }
    if (filters.walmart !== 'all') {
        filtered = filtered.filter(p => filters.walmart === 'yes' ? !!p.walmart_id : !p.walmart_id);
    }
    
    // Sorting
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        if (sortConfig.key === 'price') {
            aValue = a.variants?.[0]?.price ? parseFloat(a.variants[0].price) : 0;
            bValue = b.variants?.[0]?.price ? parseFloat(b.variants[0].price) : 0;
        } else if (sortConfig.key === 'inventory') {
            aValue = a.variants?.[0]?.inventory_quantity ?? 0;
            bValue = b.variants?.[0]?.inventory_quantity ?? 0;
        } else {
            aValue = a[sortConfig.key as keyof ShopifyProduct];
            bValue = b[sortConfig.key as keyof ShopifyProduct];
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [products, sortConfig, filters]);

  const totalPages = Math.ceil(sortedAndFilteredProducts.length / productsPerPage);
  const currentProducts = sortedAndFilteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const requestSort = (key: keyof ShopifyProduct | 'price' | 'inventory') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'outline';
    }
  };
  
  const handlePageSizeChange = (value: string) => {
      setProductsPerPage(Number(value));
      setCurrentPage(1); // Reset to first page
  }

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
      setFilters(prev => ({...prev, [filterType]: value}));
      setCurrentPage(1);
  }

  if (products.length === 0 && !isLoading) {
    return (
       <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[40vh]">
            <Shirt className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>No Products Found</CardTitle>
            <CardDescription className="mt-2 max-w-md">
                There are no products to display for this marketplace at the moment.
            </CardDescription>
        </Card>
    );
  }

  const SortableHeader = ({ sortKey, children }: { sortKey: keyof ShopifyProduct | 'price' | 'inventory', children: React.ReactNode }) => (
    <TableHead>
        <Button variant="ghost" onClick={() => requestSort(sortKey)} className="px-2">
            {children}
            {sortConfig?.key === sortKey && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
    </TableHead>
  );

  return (
    <>
      <Card>
         <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <CardTitle>Product Listings</CardTitle>
                    <CardDescription>
                        Showing {Math.min(productsPerPage, currentProducts.length)} of {sortedAndFilteredProducts.length} products from {platform}.
                    </CardDescription>
                </div>
                 <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem checked={filters.status === 'all'} onCheckedChange={() => handleFilterChange('status', 'all')}>All</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={filters.status === 'active'} onCheckedChange={() => handleFilterChange('status', 'active')}>Active</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={filters.status === 'draft'} onCheckedChange={() => handleFilterChange('status', 'draft')}>Draft</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={filters.status === 'archived'} onCheckedChange={() => handleFilterChange('status', 'archived')}>Archived</DropdownMenuCheckboxItem>
                            
                            <DropdownMenuLabel>Amazon</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem checked={filters.amazon === 'all'} onCheckedChange={() => handleFilterChange('amazon', 'all')}>All</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={filters.amazon === 'yes'} onCheckedChange={() => handleFilterChange('amazon', 'yes')}>Available</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={filters.amazon === 'no'} onCheckedChange={() => handleFilterChange('amazon', 'no')}>Not Available</DropdownMenuCheckboxItem>

                            <DropdownMenuLabel>Walmart</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem checked={filters.walmart === 'all'} onCheckedChange={() => handleFilterChange('walmart', 'all')}>All</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={filters.walmart === 'yes'} onCheckedChange={() => handleFilterChange('walmart', 'yes')}>Available</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={filters.walmart === 'no'} onCheckedChange={() => handleFilterChange('walmart', 'no')}>Not Available</DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {onPushToDb && (
                         <Button variant="outline" size="sm" onClick={onPushToDb} disabled={isLoading || isPushingToDb}>
                            {isPushingToDb ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                            Push to DB
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading || isPushingToDb}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Shopify SKU</TableHead>
                <TableHead>Amazon ASIN</TableHead>
                <TableHead>Walmart ID</TableHead>
                <TableHead>Status</TableHead>
                <SortableHeader sortKey="inventory">Inventory</SortableHeader>
                <SortableHeader sortKey="price">Price</SortableHeader>
                {connectedChannels.map(channel => (
                  <TableHead key={channel} className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Image src={platformIcons[channel]} alt={channel} width={18} height={18} className="mx-auto" />
                        </TooltipTrigger>
                        <TooltipContent>
                           <p className="capitalize">{channel}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                ))}
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell>{product.variants?.[0]?.sku || 'N/A'}</TableCell>
                  <TableCell>
                    {product.amazon_asin ? (
                      <a 
                        href={`https://www.amazon.com/dp/${product.amazon_asin}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {product.amazon_asin}
                      </a>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>
                     {product.walmart_id ? (
                      <a 
                        href={`https://www.walmart.com/ip/${product.walmart_id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {product.walmart_id}
                      </a>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(product.status)}>{product.status}</Badge>
                  </TableCell>
                  <TableCell>{product.variants?.[0]?.inventory_quantity ?? 'N/A'}</TableCell>
                  <TableCell>${product.variants?.[0]?.price ?? 'N/A'}</TableCell>
                  {connectedChannels.map(channel => (
                     <TableCell key={channel} className="text-center">
                       <StatusIndicator 
                         isConnected={product.linked_to_platforms?.includes(channel) ?? false}
                         platform={channel}
                         onConnect={() => onProductCreate(product.id, channel)}
                       />
                     </TableCell>
                  ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuItem asChild>
                            <Link href={`/products/${product.id}/edit`}>Edit Product</Link>
                         </DropdownMenuItem>
                         {/* More actions can be added here */}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
         pageSize={productsPerPage}
         onPageSizeChange={handlePageSizeChange}
         className="mt-4"
      />
    </>
  );
}

