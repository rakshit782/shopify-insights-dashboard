
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { ShopifyProduct } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Star, Pencil } from 'lucide-react';
import { ProductSummaryGenerator } from './product-summary-generator';
import Link from 'next/link';
import { Button } from './ui/button';

interface ProductTableProps {
  products: ShopifyProduct[];
}

export function ProductTable({ products }: ProductTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px]">Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Inventory</TableHead>
            <TableHead>Units Sold</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead className="text-right">Rating</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const numericId = product.id.split('/').pop();
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="64px"
                        data-ai-hint={product.imageHint}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.vendor}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.inventory}</TableCell>
                <TableCell>{product.unitsSold.toLocaleString()}</TableCell>
                <TableCell>
                  ${product.totalRevenue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>{product.averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({product.numberOfReviews})
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <ProductSummaryGenerator product={product} />
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/products/${numericId}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
