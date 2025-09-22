
'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { ProductCard } from '@/components/product-card';
import { getShopifyProducts } from '@/lib/shopify-client';
import type { ShopifyProduct } from '@/lib/types';
import { ProductTable } from '@/components/product-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Settings, ChevronDown, Server, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSupabaseCredentials } from './settings/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [productData, setProductData] = useState<ShopifyProduct[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSupabaseCreds, setHasSupabaseCreds] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLogsOpen, setIsLogsOpen] = useState(true);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    const checkCredentialsAndFetch = async () => {
      setIsLoading(true);
      setError(null);
      setHasSupabaseCreds(null);
      setLogs([]); // Clear logs on each fetch

      addLog('Starting data fetch process...');
      
      addLog('Checking for Supabase credentials in cookies...');
      const creds = await getSupabaseCredentials();
      
      const hasCreds = creds.supabaseUrl && creds.supabaseKey && !creds.supabaseUrl.includes('YOUR_SUPABASE_URL');
      setHasSupabaseCreds(hasCreds);
      
      if (!hasCreds) {
        const logMsg = 'Supabase credentials not found or incomplete in cookies.';
        addLog(logMsg);
        setIsLoading(false);
        return;
      }

      addLog(`Found credentials. Supabase URL: ${creds.supabaseUrl}`);
      addLog('Attempting to fetch Shopify products...');

      try {
        const { products, logs: fetchLogs } = await getShopifyProducts();
        fetchLogs.forEach(log => addLog(log));
        setProductData(products);
        addLog(`Successfully fetched ${products.length} products.`);
      } catch (e) {
        if (e instanceof Error) {
          addLog(`ERROR: ${e.message}`);
          setError(e.message);
        } else {
          const unknownError = 'An unknown error occurred while fetching products.';
          addLog(`ERROR: ${unknownError}`);
          setError(unknownError);
        }
      } finally {
        addLog('Data fetch process finished.');
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

    if (productData.length === 0 && !isLoading) {
      return (
         <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>No Products Found</AlertTitle>
          <AlertDescription>
            Your Shopify store does not seem to have any products, or there was an issue fetching them. Please check your Shopify credentials in Supabase or go to the settings page to verify your Supabase connection. Review the logs below for more details.
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
    <div className="flex flex-col h-screen">
      <DashboardHeader 
        products={productData}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <h2 className="text-2xl font-bold tracking-tight text-foreground/80 mb-6">
          Product Overview
        </h2>
        {renderContent()}
      </main>
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
