"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MappedShopifyProduct } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  products: MappedShopifyProduct[];
}

export function ExportButton({ products }: ExportButtonProps) {
  const { toast } = useToast();

  const convertToCSV = (data: MappedShopifyProduct[]) => {
    const headers = [
      'ID', 'Title', 'Vendor', 'Product Type', 'Price', 'Inventory'
    ];
    const rows = data.map(product => {
      const numericId = product.id.split('/').pop() || product.id;
      return [
        numericId,
        `"${product.title.replace(/"/g, '""')}"`,
        `"${product.vendor.replace(/"/g, '""')}"`,
        `"${product.product_type.replace(/"/g, '""')}"`,
        product.price,
        product.inventory
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  const handleExport = () => {
    if (!products || products.length === 0) {
        toast({
            title: "No Data to Export",
            description: "There are no products to export.",
            variant: "destructive"
        });
        return;
    }
    try {
      const csvData = convertToCSV(products);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'shopify_insights_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Your product data has been downloaded as a CSV file.",
        variant: 'default',
      });
    } catch (error) {
      console.error("Failed to export data:", error);
      toast({
        title: "Export Failed",
        description: "Could not export product data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export Data
    </Button>
  );
}
