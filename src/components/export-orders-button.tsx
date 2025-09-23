
'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { ShopifyOrder } from '@/lib/types';

interface ExportOrdersButtonProps {
  orders: ShopifyOrder[];
  platform: string;
}

function convertToCSV(orders: ShopifyOrder[]) {
  if (orders.length === 0) return '';
  
  const headers = [
    'Order ID', 'Date', 'Customer Name', 'Customer Email', 'Total Price', 
    'Currency', 'Financial Status', 'Fulfillment Status', 'Item Count', 'SKUs'
  ];

  const rows = orders.map(order => {
    const customerName = `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim();
    const itemCount = order.line_items.reduce((sum, item) => sum + item.quantity, 0);
    const skus = order.line_items.map(item => item.sku).join(', ');

    return [
      order.name,
      new Date(order.created_at).toLocaleDateString(),
      customerName,
      order.customer?.email || '',
      order.total_price,
      order.currency,
      order.financial_status,
      order.fulfillment_status,
      itemCount,
      skus
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function ExportOrdersButton({ orders, platform }: ExportOrdersButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    setIsExporting(true);
    try {
      const csvData = convertToCSV(orders);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${platform}-orders-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: `Your orders from ${platform} have been exported.`
      });

    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An error occurred while trying to export orders.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting || orders.length === 0}>
      {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      Export CSV
    </Button>
  );
}
