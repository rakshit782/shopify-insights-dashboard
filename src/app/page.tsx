
// app/page.tsx
import { Suspense } from 'react'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'

function AnalyticsSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Skeleton className="h-8 w-1/4 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="h-96 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  )
}

export default async function Home() {
  // 🔑 Check Supabase env vars (server-only)
  const supabaseUrl = process.env.SUPABASE_URL_MAIN
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY_MAIN

  if (!supabaseUrl || !supabaseKey) {
     return (
          <div className="flex h-screen items-center justify-center p-8">
            <Alert variant="destructive" className="max-w-2xl">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>
                Your Supabase credentials are not configured correctly. Please add your `SUPABASE_URL_MAIN` and `SUPABASE_SERVICE_ROLE_KEY_MAIN` to the `.env` file in the root of the project and ensure your server is restarted.
              </AlertDescription>
            </Alert>
          </div>
        );
  }

  // ✅ Render dashboard wrapped in Suspense
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsDashboard />
    </Suspense>
  )
}
