
// app/page.tsx
import { Suspense } from 'react'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import { Skeleton } from '@/components/ui/skeleton'

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
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      '❌ Supabase credentials are missing. ' +
      'Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file, ' +
      'then restart the Next.js server.'
    )
  }

  // ✅ Render dashboard wrapped in Suspense
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsDashboard />
    </Suspense>
  )
}
