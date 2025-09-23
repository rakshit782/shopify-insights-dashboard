
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MoreHorizontal, ShoppingCart, Truck, RefreshCw, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { ShopifyOrder } from '@/lib/types';
import { handleRefundOrder, handleCancelOrder, handleShipOrder } from '@/app/actions';
import { OrderDetailsDialog } from './order-details-dialog';
import { PaginationControls } from './pagination-controls';
import { ExportOrdersButton } from './export-orders-button';

export function OrderTable({ orders, platform }: { orders: ShopifyOrder[], platform: string }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<ShopifyOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const currentOrders = orders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const handleAction = async (
    orderId: string | number,
    action: 'refund' | 'cancel' | 'ship'
  ) => {
    let result;
    const actionMap = {
        refund: handleRefundOrder,
        cancel: handleCancelOrder,
        ship: handleShipOrder
    };

    try {
        result = await actionMap[action](orderId, platform);
        if (result.success) {
            toast({
                title: 'Action Successful',
                description: result.message,
            });
            // Here you might want to re-fetch orders to update the status
        } else {
            throw new Error(result.message);
        }
    } catch (e) {
        const error = e instanceof Error ? e.message : 'An unknown error occurred.';
        toast({
            title: 'Action Failed',
            description: error,
            variant: 'destructive',
        });
    }
  };

  const openDetails = (order: ShopifyOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };
  
  const getFinancialStatusVariant = (status: string | null) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'refunded':
      case 'partially_refunded': return 'destructive';
      default: return 'outline';
    }
  };

  const handlePageSizeChange = (value: string) => {
      setOrdersPerPage(Number(value));
      setCurrentPage(1); // Reset to first page
  }

  if (orders.length === 0) {
    return (
       <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[40vh]">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>No Orders Found</CardTitle>
            <CardDescription className="mt-2 max-w-md">
                There are no orders to display for this marketplace at the moment.
            </CardDescription>
        </Card>
    );
  }

  return (
    <>
      <Card>
         <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>
                        Showing {Math.min(ordersPerPage, currentOrders.length)} of {orders.length} orders from {platform}.
                    </CardDescription>
                </div>
                <ExportOrdersButton orders={orders} platform={platform} />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrders.map(order => (
                <TableRow key={order.id} className="cursor-pointer" onClick={() => openDetails(order)}>
                  <TableCell className="font-medium">{order.name}</TableCell>
                  <TableCell>{format(new Date(order.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{order.customer?.first_name} {order.customer?.last_name}</TableCell>
                  <TableCell>${order.total_price}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Badge variant={getFinancialStatusVariant(order.financial_status)}>
                            {order.financial_status}
                        </Badge>
                        {order.fulfillment_status && <Badge variant="secondary">{order.fulfillment_status}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                         <DropdownMenuItem onClick={() => handleAction(order.id, 'ship')}>
                           <Truck className="mr-2 h-4 w-4" /> Ship Order
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(order.id, 'refund')}>
                           <RefreshCw className="mr-2 h-4 w-4" /> Refund
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(order.id, 'cancel')} className="text-destructive">
                           <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <PaginationControls
         currentPage={currentPage}
         totalPages={totalPages}
         onPageChange={setCurrentPage}
         pageSize={ordersPerPage}
         onPageSizeChange={handlePageSizeChange}
         className="mt-4"
      />
      <OrderDetailsDialog 
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        order={selectedOrder}
      />
    </>
  );
}
