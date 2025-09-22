
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ShopifyProduct } from '@/lib/types';
import { MetricDisplay } from './metric-display';
import { DollarSign, Package, Hash, Star, Users, Pencil } from 'lucide-react';
import { ProductSummaryGenerator } from './product-summary-generator';
import Link from 'next/link';
import { Button } from './ui/button';

interface ProductCardProps {
  product: ShopifyProduct;
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
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            data-ai-hint={product.imageHint}
          />
        </div>
        <div className="p-6 pb-2">
          <CardTitle className="mb-2 text-lg font-bold leading-tight tracking-tight">
            {product.title}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{product.vendor}</Badge>
            <Badge variant="outline">{product.product_type}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid flex-1 grid-cols-2 gap-4 p-6 pt-2">
        <MetricDisplay
          icon={DollarSign}
          label="Price"
          value={`$${product.price.toFixed(2)}`}
          className="text-green-600"
        />
        <MetricDisplay
          icon={Package}
          label="In Stock"
          value={product.inventory.toString()}
        />
        <MetricDisplay
          icon={Hash}
          label="Units Sold"
          value={product.unitsSold.toLocaleString()}
        />
        <MetricDisplay
          icon={Star}
          label="Rating"
          value={`${product.averageRating}/5`}
        />
        <MetricDisplay
          icon={Users}
          label="Reviews"
          value={product.numberOfReviews.toLocaleString()}
        />
        <MetricDisplay
          icon={DollarSign}
          label="Revenue"
          value={`$${product.totalRevenue.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`}
        />
      </CardContent>
      <CardFooter className="flex gap-2">
        <ProductSummaryGenerator product={product} />
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/products/${numericId}/edit`}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
