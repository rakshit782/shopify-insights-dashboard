
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page has been removed.
export default function ConnectionsPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/');
    }, [router]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <p className="text-muted-foreground">Redirecting...</p>
        </div>
    );
}
