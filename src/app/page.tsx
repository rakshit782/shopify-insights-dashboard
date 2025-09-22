
'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { ProductCard } from '@/components/product-card';
import { getShopifyProducts } from '@/lib/shopify-client';
import type { ShopifyProduct } from '@/lib/types';
import { ProductTable } from '@/components/product-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function Home() {
  const [productData, setProductData] = useState<ShopifyProduct[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // We are using a temporary client-side fetch here.
        // For production, this should be a server action or API route.
        const products = await getShopifyProducts();
        setProductData(products);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-6 w-3/4" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (error) {
       return (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Products</AlertTitle>
          <AlertDescription>
            Could not fetch data from Shopify. Please ensure your credentials in the `.env` file are correct and your store is accessible.
          </AlertDescription>
        </Alert>
      );
    }

    if (productData.length === 0) {
      return (
         <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>No Products Found</AlertTitle>
          <AlertDescription>
            Your Shopify store does not seem to have any products, or there was an issue fetching them. If you've just added credentials, please refresh the page.
          </AlertDescription>
        </Alert>
      )
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productData.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      );
    } else {
      return <ProductTable products={productData} />;
    }
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader 
        products={productData}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground/80 mb-6">
          Product Overview
        </h2>
        {renderContent()}
      </main>
    </div>
  );
}
