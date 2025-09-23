
import { WebsiteProductTable } from '@/components/website-product-table';
import { handleGetWebsiteProducts } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default async function ProductDatabasePage() {
    const supabaseDataUrl = process.env.SUPABASE_URL_DATA;
    const supabaseDataKey = process.env.SUPABASE_SERVICE_ROLE_KEY_DATA;
    
    if (!supabaseDataUrl || !supabaseDataKey) {
        return (
          <div className="flex h-screen items-center justify-center p-8">
            <Alert variant="destructive" className="max-w-2xl">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>
                Your Supabase **DATA** credentials are not configured correctly. Please add `SUPABASE_URL_DATA` and `SUPABASE_SERVICE_ROLE_KEY_DATA` to your `.env` file and restart the server to view the product database.
              </AlertDescription>
            </Alert>
          </div>
        );
    }
    
    const { products, error } = await handleGetWebsiteProducts();

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Product Database</h1>
                <p className="text-muted-foreground">
                    View and manage all product data synced from your channels to your Supabase instance.
                </p>
            </div>
            {error ? (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Failed to load products</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : (
                <WebsiteProductTable products={products} />
            )}
        </div>
    );
}
