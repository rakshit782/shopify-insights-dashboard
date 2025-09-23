
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ListTodo } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="max-w-xl text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome to Shopify Insights
          </CardTitle>
          <CardDescription>
            Your central hub for managing and optimizing your e-commerce operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Get started by managing your listings, viewing orders, or connecting new sales channels.
          </p>
        </CardContent>
        <CardContent>
           <Button asChild>
              <Link href="/listing-manager">
                <ListTodo className="mr-2 h-4 w-4" /> Go to Listing Manager
              </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
