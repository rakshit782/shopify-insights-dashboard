
import { Suspense } from 'react';
import { Dashboard } from '@/components/dashboard';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { getShopifyProducts, mapShopifyProducts } from '@/lib/shopify-client';
import 'dotenv/config';

export default async function Home() {
  // Check for the public-facing variables for client and server, and service_role for server
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const websiteUrl = process.env.WEBSITE_SUPABASE_URL;
  const websiteKey = process.env.WEBSITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey || !websiteUrl || !websiteKey) {
    return (
      <div className="flex h-screen items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-2xl">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Your Supabase credentials are not configured correctly. Please add your `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`), `WEBSITE_SUPABASE_URL`, and `WEBSITE_SUPABASE_SERVICE_ROLE_KEY` to the `.env` file in the root of the project and ensure your server is restarted.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  try {
    const { rawProducts, logs } = await getShopifyProducts();
    const products = mapShopifyProducts(rawProducts);
    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard initialProducts={products} initialLogs={logs} />
      </Suspense>
    );
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    return (
       <div className="flex h-screen items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-2xl">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Products</AlertTitle>
          <AlertDescription>
            {error}
            <p className='mt-2'>Please ensure your Supabase and Shopify credentials are correctly set in their respective places and that your Supabase table is set up correctly.</p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }
}
