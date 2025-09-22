
"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShopifyOrder } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

interface ExportOrdersButtonProps {
  orders: ShopifyOrder[];
}

const getCustomerName = (order: ShopifyOrder) => {
    if (order.customer) return `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim();
    if (order.shipping_address) return `${order.shipping_address.first_name || ''} ${order.shipping_address.last_name || ''}`.trim();
    return 'N/A';
};

const getFullAddress = (address: ShopifyOrder['shipping_address']) => {
    if (!address) return '';
    return [
      address.address1,
      address.address2,
      `${address.city}, ${address.province} ${address.zip}`,
      address.country
    ].filter(Boolean).join(', ');
};

export function ExportOrdersButton({ orders }: ExportOrdersButtonProps) {
  const { toast } = useToast();

  const convertToCSV = (data: ShopifyOrder[]) => {
    const headers = [
      'Order ID', 'Customer Name', 'Customer Email', 'Order Date', 'Total Price', 'Currency', 
      'Financial Status', 'Fulfillment Status', 'Shipping Address', 'Country', 'Phone'
    ];
    
    const rows = data.map(order => {
        const row = [
            order.name,
            getCustomerName(order),
            order.customer?.email || 'N/A',
            format(new Date(order.created_at), 'yyyy-MM-dd HH:mm:ss'),
            order.total_price,
            order.currency,
            order.financial_status,
            order.fulfillment_status || 'unfulfilled',
            getFullAddress(order.shipping_address),
            order.shipping_address?.country || 'N/A',
            order.customer?.phone || order.shipping_address?.phone || 'N/A',
        ];
        // Escape commas and wrap in quotes
        return row.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  const handleExport = () => {
    if (orders.length === 0) {
      toast({
        title: "No Orders to Export",
        description: "There are no orders matching the current filters.",
        variant: "destructive",
      });
      return;
    }

    try {
      const csvData = convertToCSV(orders);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const date = format(new Date(), 'yyyy-MM-dd');
      link.setAttribute('href', url);
      link.setAttribute('download', `orders_export_${date}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `${orders.length} orders have been downloaded as a CSV file.`,
        variant: 'default',
      });
    } catch (error) {
      console.error("Failed to export data:", error);
      toast({
        title: "Export Failed",
        description: "Could not export order data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="outline" size="default" onClick={handleExport} className="w-full sm:w-auto">
      <Download className="mr-2 h-4 w-4" />
      Export
    </Button>
  );
}
