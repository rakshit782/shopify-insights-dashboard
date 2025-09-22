
import { Suspense } from 'react';
import { Dashboard } from '@/components/dashboard';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { mapShopifyProducts } from '@/lib/shopify-client';
import { getWebsiteProducts } from '@/lib/website-supabase-client';
import 'dotenv/config';

export default async function WebsiteProductsPage() {
  const websiteUrl = process.env.WEBSITE_SUPABASE_URL;
  const websiteKey = process.env.WEBSITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!websiteUrl || !websiteKey) {
    return (
      <div className="flex h-screen items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-2xl">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Your website's Supabase credentials are not configured correctly. Please add your `WEBSITE_SUPABASE_URL` and `WEBSITE_SUPABASE_SERVICE_ROLE_KEY` to the `.env` file.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  try {
    const { rawProducts, logs } = await getWebsiteProducts();
    const products = mapShopifyProducts(rawProducts);
    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard initialProducts={products} initialLogs={logs} dataSource="website" />
      </Suspense>
    );
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    return (
       <div className="flex h-screen items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-2xl">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Products from Website DB</AlertTitle>
          <AlertDescription>
            {error}
            <p className='mt-2'>Please ensure your Website Supabase credentials are correctly set and that your `products` table is set up correctly.</p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }
}
