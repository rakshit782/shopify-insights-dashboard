'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeprecatedPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <p className="text-muted-foreground">This page has been removed. Redirecting...</p>
    </div>
  );
}
