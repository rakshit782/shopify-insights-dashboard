
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ShopifyOrder } from '@/lib/types';
import { format } from 'date-fns';

interface OrderDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: ShopifyOrder | null;
}

export function OrderDetailsDialog({ isOpen, onOpenChange, order }: OrderDetailsDialogProps) {
  if (!order) return null;

  const getFinancialStatusVariant = (status: string | null) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'refunded':
      case 'partially_refunded': return 'destructive';
      default: return 'outline';
    }
  };

  const getFulfillmentStatusVariant = (status: string | null) => {
    switch (status) {
      case 'fulfilled':
      case 'Shipped':
      case 'Delivered': return 'default';
      case 'unfulfilled':
      case 'Created':
      case 'Acknowledged': return 'secondary';
      case 'partial': return 'outline';
      default: return 'outline';
    }
  };

  const customerName = `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim() || 'N/A';
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order #{order.name}</DialogTitle>
          <DialogDescription>
            {format(new Date(order.created_at), 'MMMM d, yyyy h:mm a')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                <p>{customerName}</p>
                <p className="text-sm text-muted-foreground">{order.customer?.email}</p>
            </div>
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Shipping Address</p>
                <p>{order.shipping_address?.address1}</p>
                <p className="text-sm text-muted-foreground">{order.shipping_address?.city}, {order.shipping_address?.province} {order.shipping_address?.zip}</p>
             </div>
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                 <div className="flex flex-col items-start gap-2">
                    <Badge variant={getFinancialStatusVariant(order.financial_status)}>{order.financial_status || 'N/A'}</Badge>
                    <Badge variant={getFulfillmentStatusVariant(order.fulfillment_status)}>{order.fulfillment_status || 'N/A'}</Badge>
                </div>
             </div>
          </div>
          <Separator />
          <div>
            <h4 className="text-md font-medium mb-2">Items</h4>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {order.line_items.map((item, index) => (
                        <TableRow key={item.id || index}>
                            <TableCell>{item.title}</TableCell>
                            <TableCell>{item.sku || 'N/A'}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">${item.price}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </div>
           <Separator />
           <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">${order.total_price}</p>
              </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
