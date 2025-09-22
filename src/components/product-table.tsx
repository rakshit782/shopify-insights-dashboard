
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
import { Star } from 'lucide-react';

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
            <TableHead>Units Sold</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead className="text-right">Rating</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
