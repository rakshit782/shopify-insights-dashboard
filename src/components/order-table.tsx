
'use client';

import { useState } from 'react';
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
import type { ShopifyOrder } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { OrderDetailsDialog } from './order-details-dialog';

interface OrderTableProps {
  orders: ShopifyOrder[];
  platform: string;
}

export function OrderTable({ orders, platform }: OrderTableProps) {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<ShopifyOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAction = (action: string, orderId: string) => {
    toast({
      title: `Action: ${action}`,
      description: `Placeholder for ${action} on order ${orderId}.`,
    });
  };

  const handleRowClick = (order: ShopifyOrder) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const getStatusVariant = (status: string | null) => {
    switch (status) {
      case 'fulfilled':
        return 'default';
      case 'unfulfilled':
      case null:
        return 'secondary';
      case 'partial':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getFinancialStatusVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'refunded':
      case 'partially_refunded':
        return 'outline';
      case 'voided':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  const getCustomerName = (order: ShopifyOrder) => {
    if (order.customer) {
        return `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim();
    }
    if (order.shipping_address) {
        return `${order.shipping_address.first_name || ''} ${order.shipping_address.last_name || ''}`.trim();
    }
    return 'N/A';
  }

  const getProductTitles = (order: ShopifyOrder) => {
    return order.line_items.map(item => item.title).join(', ');
  }

   const getFullAddress = (address: ShopifyOrder['shipping_address']) => {
    if (!address) return '';
    return [
      address.address1,
      address.address2,
      `${address.city}, ${address.province} ${address.zip}`,
    ].filter(Boolean).join(', ');
  };

  return (
    <>
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product(s)</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Country</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id}>
              <TableCell>
                <Button variant="link" className="p-0 h-auto font-medium" onClick={() => handleRowClick(order)}>
                  {order.name}
                </Button>
              </TableCell>
              <TableCell>{format(new Date(order.created_at), 'PP')}</TableCell>
              <TableCell>
                <div className="font-medium">{getCustomerName(order)}</div>
                <div className="text-sm text-muted-foreground">{order.customer?.email || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">{order.customer?.phone || order.shipping_address?.phone || 'N/A'}</div>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">{getProductTitles(order)}</TableCell>
              <TableCell>{getFullAddress(order.shipping_address)}</TableCell>
              <TableCell>{order.shipping_address?.country || 'N/A'}</TableCell>
              <TableCell className="text-right">
                {parseFloat(order.total_price).toLocaleString('en-US', {
                  style: 'currency',
                  currency: order.currency,
                })}
              </TableCell>
              <TableCell className="text-center">
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => handleRowClick(order)}>View Details</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => handleAction('Confirm Shipment', order.name)}>Confirm Shipment</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleAction('Process Refund', order.name)}>Process Refund</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleAction('Cancel Order', order.name)}>Cancel Order</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
    {selectedOrder && (
        <OrderDetailsDialog 
            isOpen={isDialogOpen} 
            onOpenChange={setIsDialogOpen}
            order={selectedOrder}
            platform={platform}
            onAction={handleAction}
        />
    )}
    </>
  );
}

// Augmenting shipping_address to potentially have first_name and last_name which it often does
declare module '@/lib/types' {
    interface ShopifyOrder {
        shipping_address: {
            first_name?: string;
            last_name?: string;
            address1: string;
            address2: string | null;
            city: string;
            province: string;
            country: string;
            zip: string;
            phone: string | null;
        } | null;
    }
}
