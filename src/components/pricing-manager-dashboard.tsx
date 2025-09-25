

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { handleGetWebsiteProducts, handleBulkUpdatePrices } from '@/app/actions';
import type { ShopifyProduct } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';

const priceUpdateSchema = z.object({
  id: z.string(), // admin_graphql_api_id
  title: z.string(),
  sku: z.string().optional(),
  amazon_asin: z.string().optional(),
  walmart_id: z.string().optional(),
  shopify_price: z.coerce.number().positive().optional(),
  amazon_price: z.coerce.number().positive().optional(),
  walmart_price: z.coerce.number().positive().optional(),
});

const formSchema = z.object({
  products: z.array(priceUpdateSchema),
});

type FormValues = z.infer<typeof formSchema>;

function PricingDashboardSkeleton() {
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

export function PricingManagerDashboard() {
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
        amazon_asin: p.amazon_asin || '',
        walmart_id: p.walmart_id || '',
        // For now, we only handle Shopify pricing.
        // A real implementation would fetch live prices from other platforms.
        shopify_price: parseFloat(p.variants?.[0]?.price || '0'),
        amazon_price: 0, // Placeholder
        walmart_price: 0, // Placeholder
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
    toast({ title: 'Bulk price update started...', description: 'Please wait while we update your listings.' });
    const result = await handleBulkUpdatePrices(data.products);
    
    if (result.success) {
        toast({
            title: 'Update Successful',
            description: `${result.updatedCount} prices were updated. ${result.errorCount} failed.`
        });
        fetchProducts(); // Refresh data
    } else {
         toast({
            title: 'Update Failed',
            description: result.message,
            variant: 'destructive'
        });
    }
    form.reset(form.getValues()); // Reset dirty fields state
  };

  if (isLoading) {
    return <PricingDashboardSkeleton />;
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Manage Prices</CardTitle>
                            <CardDescription>Edit prices and save changes in bulk.</CardDescription>
                        </div>
                        <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
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
                                <TableHead>Shopify Price</TableHead>
                                <TableHead>Amazon Price</TableHead>
                                <TableHead>Walmart Price</TableHead>
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
                                            name={`products.${index}.shopify_price`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" {...field} className="w-28" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`products.${index}.amazon_price`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" {...field} className="w-28" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`products.${index}.walmart_price`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" {...field} className="w-28" />
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

    