
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton({ hasHeader = true }: { hasHeader?: boolean }) {
  return (
    <div className="flex flex-col h-screen">
      {hasHeader && (
         <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <Skeleton className="h-8 w-24" />
            <div className="ml-auto flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-9 w-32" />
            </div>
        </header>
      )}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <h2 className="text-xl font-bold tracking-tight text-foreground/80 mb-6">
          Product Overview
        </h2>
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
      </main>
    </div>
  );
}
