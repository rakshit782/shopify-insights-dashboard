
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
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            data-ai-hint={product.imageHint}
            unoptimized
          />
        </div>
        <div className="p-3 pb-2">
          <CardTitle className="text-sm font-medium leading-tight tracking-tight truncate" title={product.title}>
            {product.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground truncate">{product.vendor}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-3 pt-0">
         <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-primary">${product.price.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">Stock: {product.inventory}</span>
         </div>
      </CardContent>
      <CardFooter className="mt-auto p-3 pt-0">
        <Button asChild variant="outline" size="sm" className="w-full h-8">
          <Link href={`/products/${numericId}/edit`}>
            <Pencil className="mr-2 h-3 w-3" /> Edit
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
