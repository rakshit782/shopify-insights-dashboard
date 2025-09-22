
import { Suspense } from 'react';
import { Dashboard } from '@/components/dashboard';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function Home() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_SUPABASE_URL') || supabaseKey.includes('YOUR_SUPABASE_ANON_KEY')) {
    return (
      <div className="flex h-screen items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-2xl">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Your Supabase credentials are not configured correctly. Please add your `SUPABASE_URL` and `SUPABASE_KEY` to the `.env` file in the root of the project and ensure your server is restarted.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}
