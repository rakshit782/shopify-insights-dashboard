
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { ProductCard } from '@/components/product-card';
import type { MappedShopifyProduct } from '@/lib/types';
import { ProductTable } from '@/components/product-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DashboardSkeleton } from './dashboard-skeleton';
import { PaginationControls } from './pagination-controls';

interface DashboardProps {
  initialProducts: MappedShopifyProduct[];
  initialLogs: string[];
  error?: string | null;
  dataSource?: 'shopify' | 'website';
}

export function Dashboard({ initialProducts, initialLogs, error: initialError, dataSource = 'shopify' }: DashboardProps) {
  const [productData, setProductData] = useState<MappedShopifyProduct[]>(initialProducts);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(initialError || null);
  const [logs, setLogs] = useState<string[]>(initialLogs);
  const [isLogsOpen, setIsLogsOpen] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // Default to a higher number for grid view

  const addLog = (message: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLogs([]); 
    setCurrentPage(1); // Reset to first page on new fetch

    addLog(`Starting data fetch from ${dataSource}...`);
    
    try {
      const endpoint = dataSource === 'shopify' ? '/api/products/shopify' : '/api/products/website';
      const response = await fetch(endpoint, { cache: 'no-store' });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }

      const { products: mappedProducts, logs: fetchLogs } = await response.json();

      fetchLogs.forEach((log: string) => addLog(log));
      setProductData(mappedProducts);
      addLog(`Successfully fetched and mapped ${mappedProducts.length} products.`);
    } catch (e) {
      if (e instanceof Error) {
        const errorMessage = e.message;
        addLog(`ERROR: ${errorMessage}`);
        setError(errorMessage);
      } else {
        const unknownError = 'An unknown error occurred while fetching products.';
        addLog(`ERROR: ${unknownError}`);
        setError(unknownError);
      }
    } finally {
      addLog('Data fetch process finished.');
      setIsLoading(false);
    }
  }, [dataSource]);

  useEffect(() => {
    // Fetch data when the component mounts
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (error || logs.length > 0) {
      setIsLogsOpen(true);
    }
  }, [error, logs]);

  const { paginatedData, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = productData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(productData.length / itemsPerPage);
    return { paginatedData, totalPages };
  }, [productData, currentPage, itemsPerPage]);

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }

  const renderContent = () => {
    if (isLoading) {
      return <DashboardSkeleton hasHeader={false} />;
    }
    
    if (error) {
       return (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Products</AlertTitle>
          <AlertDescription>
            {error}
            <p className='mt-2'>Please check your configuration and review the logs below.</p>
          </AlertDescription>
        </Alert>
      );
    }

    if (productData.length === 0 && !isLoading) {
      return (
         <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>No Products Found</AlertTitle>
          <AlertDescription>
            No products were found in the {dataSource} data source. Please check your configuration and review the logs below.
          </AlertDescription>
        </Alert>
      )
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {paginatedData.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      );
    } else {
      return <ProductTable products={paginatedData} />;
    }
  };


  return (
    <div className="flex flex-col h-screen">
      <DashboardHeader 
        products={productData}
        viewMode={viewMode}
        onViewModeChange={(mode) => {
            setViewMode(mode);
            // Adjust items per page based on view
            if (mode === 'grid') {
                setItemsPerPage(12);
            } else {
                setItemsPerPage(10);
            }
            setCurrentPage(1);
        }}
        onRefresh={fetchData}
        dataSource={dataSource}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <h2 className="text-xl font-bold tracking-tight text-foreground/80 mb-6">
          {dataSource === 'shopify' ? 'Shopify Products' : 'Website Products'}
        </h2>
        {renderContent()}
      </main>
      {productData.length > 0 && !isLoading && !error && (
         <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          totalItems={productData.length}
        />
      )}
      <div className="flex-shrink-0">
        <Collapsible open={isLogsOpen} onOpenChange={setIsLogsOpen} className="w-full">
            <CollapsibleTrigger className="w-full bg-muted/50 p-2 border-t">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4" />
                        <span className="font-semibold text-sm">Logs</span>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isLogsOpen ? 'rotate-180' : ''}`} />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <ScrollArea className="h-48">
                <div className="bg-background p-4 text-sm font-mono">
                    {logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2">
                        <span className="text-muted-foreground w-24 flex-shrink-0">{log.match(/\[(.*?)\]/)?.[1]}</span>
                        <Separator orientation="vertical" className="h-5" />
                        <p className={`whitespace-pre-wrap ${log.includes('ERROR') ? 'text-destructive' : ''}`}>{log.substring(log.indexOf(']') + 2)}</p>
                    </div>
                    ))}
                </div>
                </ScrollArea>
            </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
