import { ShoppingCart } from 'lucide-react';
import type { ShopifyProduct } from '@/lib/types';
import { ExportButton } from './export-button';

interface DashboardHeaderProps {
  products: ShopifyProduct[];
}

export function DashboardHeader({ products }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-bold tracking-tight text-foreground">
          Shopify Insights
        </h1>
      </div>
      <div className="ml-auto">
        <ExportButton products={products} />
      </div>
    </header>
  );
}
