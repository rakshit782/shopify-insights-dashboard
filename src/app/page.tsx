
'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { ProductCard } from '@/components/product-card';
import { getShopifyProducts } from '@/lib/shopify-client';
import type { ShopifyProduct } from '@/lib/types';
import { ProductTable } from '@/components/product-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSupabaseCredentials } from './settings/actions';

export default function Home() {
  const [productData, setProductData] = useState<ShopifyProduct[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSupabaseCreds, setHasSupabaseCreds] = useState<boolean | null>(null);

  useEffect(() => {
    const checkCredentialsAndFetch = async () => {
      setIsLoading(true);
      setError(null);
      setHasSupabaseCreds(null);
      
      const creds = await getSupabaseCredentials();
      
      const hasCreds = creds.supabaseUrl && creds.supabaseKey && !creds.supabaseUrl.includes('YOUR_SUPABASE_URL');
      setHasSupabaseCreds(hasCreds);
      
      if (!hasCreds) {
        setIsLoading(false);
        return;
      }

      try {
        const products = await getShopifyProducts();
        setProductData(products);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred while fetching products.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    checkCredentialsAndFetch();
  }, []);

  const renderContent = () => {
    if (isLoading || hasSupabaseCreds === null) {
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

    if (hasSupabaseCreds === false) {
      return (
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Configuration Required</AlertTitle>
          <AlertDescription>
            <div className='flex flex-col gap-4'>
            <p>Please configure your Supabase credentials to fetch Shopify data.</p>
            <Button asChild className='w-fit'>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" /> Go to Settings
              </Link>
            </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }
    
    if (error) {
       return (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Products</AlertTitle>
          <AlertDescription>
            {error}
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
            Your Shopify store does not seem to have any products, or there was an issue fetching them. Please check your Shopify credentials in Supabase or go to the settings page to verify your Supabase connection.
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
    <>
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
    </>
  );
}
