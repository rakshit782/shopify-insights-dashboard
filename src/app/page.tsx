
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ListTodo } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Welcome to Shopify Insights
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Your central hub for managing and optimizing your e-commerce operations across all sales channels. Get started by diving into your listings.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
           <Button asChild>
              <Link href="/cataloging-manager">
                <ListTodo className="mr-2 h-4 w-4" /> Go to Cataloging Manager
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/channel-health">
                Check Channel Health <span aria-hidden="true">→</span>
              </Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
