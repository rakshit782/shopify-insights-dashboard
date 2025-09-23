
import { Suspense } from 'react';
import { Dashboard } from '@/components/dashboard';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import 'dotenv/config';

export default async function WebsiteProductsPage() {
  const websiteUrl = process.env.SUPABASE_URL_DATA;
  const websiteKey = process.env.SUPABASE_SERVICE_ROLE_KEY_DATA;

  if (!websiteUrl || !websiteKey) {
    return (
      <div className="flex h-screen items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-2xl">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Your website's Supabase credentials are not configured correctly. Please add your `SUPABASE_URL_DATA` and `SUPABASE_SERVICE_ROLE_KEY_DATA` to the `.env` file.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard dataSource="website" />
    </Suspense>
  );
}
