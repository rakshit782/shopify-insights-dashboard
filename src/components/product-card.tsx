
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MappedShopifyProduct } from '@/lib/types';
import { MetricDisplay } from './metric-display';
import { DollarSign, Package, Pencil } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

interface ProductCardProps {
  product: MappedShopifyProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  
  // Extract the numeric ID from the GraphQL GID
  const numericId = product.id.split('/').pop();

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            data-ai-hint={product.imageHint}
          />
        </div>
        <div className="p-4 pb-2">
          <CardTitle className="mb-2 text-base font-semibold leading-tight tracking-tight">
            {product.title}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{product.vendor}</Badge>
            <Badge variant="outline">{product.product_type}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid flex-1 grid-cols-2 gap-x-4 gap-y-4 p-4 pt-2">
        <MetricDisplay
          icon={DollarSign}
          label="Price"
          value={`$${product.price.toFixed(2)}`}
          className="text-primary"
        />
        <MetricDisplay
          icon={Package}
          label="In Stock"
          value={product.inventory.toString()}
        />
      </CardContent>
      <CardFooter className="mt-auto p-4 pt-0">
        <Button asChild variant="secondary" size="sm" className="w-full">
          <Link href={`/products/${numericId}/edit`}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
