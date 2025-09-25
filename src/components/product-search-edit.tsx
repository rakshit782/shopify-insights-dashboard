
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { handleGetProductBySku } from '@/app/actions';
import type { ShopifyProduct } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { EditProductForm } from './edit-product-form';

const searchSchema = z.object({
  sku: z.string().min(1, 'SKU is required.'),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export function ProductSearchAndEdit() {
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { sku: '' },
  });

  const onSearch = async (values: SearchFormValues) => {
    setIsSearching(true);
    setError(null);
    setProduct(null);

    const result = await handleGetProductBySku(values.sku);

    if (result.success && result.product) {
      setProduct(result.product);
      toast({
        title: 'Product Found',
        description: `Now editing "${result.product.title}".`,
      });
    } else {
      setError(result.error);
      toast({
        title: 'Search Failed',
        description: result.error,
        variant: 'destructive',
      });
    }

    setIsSearching(false);
  };

  const handleEditSuccess = () => {
    // After a successful edit, clear the form to allow a new search
    setProduct(null);
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search & Edit Product</CardTitle>
        <CardDescription>
          Enter a product SKU to find and edit its catalog information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSearch)} className="flex items-start gap-4">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel className="sr-only">SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product SKU..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </form>
        </Form>

        <div className="mt-8">
            {error && !isSearching && (
                 <Alert variant="destructive">
                    <AlertTitle>Not Found</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {product && (
                <div className="mt-6 border-t pt-6">
                    <EditProductForm product={product} onSuccess={handleEditSuccess} />
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
