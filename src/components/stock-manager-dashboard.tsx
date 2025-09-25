
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { handleGetWebsiteProducts } from '@/app/actions';
import type { ShopifyProduct } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';

const stockUpdateSchema = z.object({
  id: z.string(), // admin_graphql_api_id
  title: z.string(),
  sku: z.string().optional(),
  shopify_inventory: z.coerce.number().int().optional(),
  amazon_inventory: z.coerce.number().int().optional(),
  walmart_inventory: z.coerce.number().int().optional(),
});

const formSchema = z.object({
  products: z.array(stockUpdateSchema),
});

type FormValues = z.infer<typeof formSchema>;

function StockDashboardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-9 w-28" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function StockManagerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      products: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'products',
  });

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    const result = await handleGetWebsiteProducts();
    if (result.success) {
      const productData = result.products.map(p => ({
        id: p.admin_graphql_api_id,
        title: p.title,
        sku: p.variants?.[0]?.sku || 'N/A',
        // In a real app, you would fetch live stock from other platforms.
        shopify_inventory: p.variants?.[0]?.inventory_quantity ?? 0,
        amazon_inventory: 0, // Placeholder
        walmart_inventory: 0, // Placeholder
      }));
      replace(productData);
    } else {
      toast({
        title: 'Error fetching products',
        description: result.error,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  }, [replace, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onSubmit = async (data: FormValues) => {
    toast({ title: 'Bulk stock update started...', description: 'This feature is not yet connected.' });
    console.log("Bulk stock update data:", data.products);
    // In a real app, you would call a server action like handleBulkUpdateStock here.
    // const result = await handleBulkUpdateStock(data.products);
  };

  if (isLoading) {
    return <StockDashboardSkeleton />;
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Manage Stock</CardTitle>
                            <CardDescription>Edit inventory levels and save changes in bulk.</CardDescription>
                        </div>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save All Changes
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product Title</TableHead>
                                <TableHead>Shopify SKU</TableHead>
                                <TableHead>Shopify Stock</TableHead>
                                <TableHead>Amazon Stock</TableHead>
                                <TableHead>Walmart Stock</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field, index) => (
                                <TableRow key={field.id}>
                                    <TableCell className="font-medium">{field.title}</TableCell>
                                    <TableCell>{field.sku}</TableCell>
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`products.${index}.shopify_inventory`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="w-28" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`products.${index}.amazon_inventory`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="w-28" disabled />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`products.${index}.walmart_inventory`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="w-28" disabled />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </form>
    </Form>
  );
}
