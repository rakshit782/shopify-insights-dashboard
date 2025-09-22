
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { ShopifyOrder } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from './ui/badge';
import { Truck, Undo2, Ban } from 'lucide-react';
import Image from 'next/image';

interface OrderDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  order: ShopifyOrder;
  platform: string;
  onAction: (action: string, orderId: string) => void;
}

const platformIcons: { [key: string]: React.ReactNode } = {
  Shopify: <Image src="/shopify.svg" alt="Shopify" width={24} height={24} />,
  Amazon: <Image src="/amazon.svg" alt="Amazon" width={24} height={24} />,
  Walmart: <Image src="/walmart.svg" alt="Walmart" width={24} height={24} />,
  eBay: <Image src="/ebay.svg" alt="eBay" width={24} height={24} />,
  Etsy: <Image src="/etsy.svg" alt="Etsy" width={24} height={24} />,
  Wayfair: <Image src="/wayfair.svg" alt="Wayfair" width={24} height={24} />,
};

export function OrderDetailsDialog({ isOpen, onOpenChange, order, platform, onAction }: OrderDetailsDialogProps) {
  
  const getCustomerName = (order: ShopifyOrder) => {
    if (order.customer) return `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim();
    if (order.shipping_address) return `${order.shipping_address.first_name || ''} ${order.shipping_address.last_name || ''}`.trim();
    return 'N/A';
  };

  const getFullAddress = (address: ShopifyOrder['shipping_address']) => {
    if (!address) return 'No address provided.';
    return [
      address.address1,
      address.address2,
      `${address.city}, ${address.province} ${address.zip}`,
      address.country
    ].filter(Boolean).join(', ');
  };
  
  const getStatusVariant = (status: string | null) => status === 'fulfilled' ? 'default' : 'secondary';
  const getFinancialStatusVariant = (status: string) => status === 'paid' ? 'default' : 'secondary';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {platformIcons[platform]}
            Order Details: {order.name}
          </DialogTitle>
          <DialogDescription>
            Order placed on {format(new Date(order.created_at), 'MMMM d, yyyy, h:mm a')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Customer</h3>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Name:</span> {getCustomerName(order)}</p>
              <p><span className="font-medium">Email:</span> {order.customer?.email || 'N/A'}</p>
              <p><span className="font-medium">Phone:</span> {order.customer?.phone || 'N/A'}</p>
            </div>
            <Separator />
            <h3 className="font-semibold text-lg">Shipping Address</h3>
            <div className="text-sm space-y-1">
                <p>{getFullAddress(order.shipping_address)}</p>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Summary</h3>
            <div className="text-sm space-y-2">
                <div className="flex justify-between"><span>Payment:</span> <Badge variant={getFinancialStatusVariant(order.financial_status)} className="capitalize">{order.financial_status.replace('_', ' ')}</Badge></div>
                <div className="flex justify-between"><span>Fulfillment:</span> <Badge variant={getStatusVariant(order.fulfillment_status)} className="capitalize">{order.fulfillment_status || 'Unfulfilled'}</Badge></div>
                <Separator className="my-2"/>
                 <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{parseFloat(order.total_price).toLocaleString('en-US', { style: 'currency', currency: order.currency })}</span>
                </div>
            </div>
            <Separator />
            <h3 className="font-semibold text-lg">Items ({order.line_items.length})</h3>
             <div className="text-sm space-y-2 max-h-48 overflow-y-auto">
                {order.line_items.map(item => (
                    <div key={item.id} className="flex justify-between items-start">
                        <p className="flex-1">{item.title} &times; {item.quantity}</p>
                        <p className="font-medium pl-4">{parseFloat(item.price).toLocaleString('en-US', { style: 'currency', currency: order.currency })}</p>
                    </div>
                ))}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 flex sm:justify-between items-center">
            <p className="text-xs text-muted-foreground hidden sm:block">Manage this order</p>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => onAction('Confirm Shipment', order.name)}>
                    <Truck className="mr-2 h-4 w-4" />
                    Confirm Shipment
                </Button>
                <Button variant="outline" onClick={() => onAction('Process Refund', order.name)}>
                    <Undo2 className="mr-2 h-4 w-4" />
                    Process Refund
                </Button>
                <Button variant="destructive" onClick={() => onAction('Cancel Order', order.name)}>
                    <Ban className="mr-2 h-4 w-4" />
                    Cancel Order
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
