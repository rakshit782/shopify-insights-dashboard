
import { Suspense } from 'react';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

function AnalyticsSkeleton() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Skeleton className="h-8 w-1/4 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-lg" />
                ))}
            </div>
            <div className="mt-8">
                 <Skeleton className="h-96 w-full rounded-lg" />
            </div>
        </div>
    )
}

export default async function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsDashboard />
    </Suspense>
  );
}
