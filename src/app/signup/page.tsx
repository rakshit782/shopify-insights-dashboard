

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is no longer used for sign-up, logic is in /login
export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?signup=true');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
