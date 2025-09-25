
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { handleGetProductBySku, handleGetCredentialStatuses } from '@/app/actions';
import type { ShopifyProduct } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { EditProductForm } from './edit-product-form';
import { Skeleton } from './ui/skeleton';

const searchSchema = z.object({
  sku: z.string().min(1, 'SKU is required.'),
});

type SearchFormValues = z.infer<typeof searchSchema>;

function SearchSkeleton() {
    return (
        <div className="mt-8 border-t pt-8">
             <Card className="max-w-4xl mx-auto border-none shadow-none">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export function ProductSearchAndEdit() {
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedChannels, setConnectedChannels] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchStatuses() {
        const result = await handleGetCredentialStatuses();
        if (result.success && result.statuses) {
            setConnectedChannels(Object.keys(result.statuses).filter(key => result.statuses[key]));
        }
    }
    fetchStatuses();
  }, []);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { sku: '' },
  });

  const onSearch = async (values: SearchFormValues) => {
    setIsSearching(true);
    setError(null);
    setProduct(null);

    const result = await handleGetProductBySku(values.sku);

    if (result.product) {
      setProduct(result.product);
      toast({
        title: 'Product Found',
        description: `Now editing "${result.product.title}".`,
      });
    } else {
      setError(result.error || 'Product with the specified SKU was not found in the database.');
      toast({
        title: 'Search Failed',
        description: result.error || 'Product not found.',
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
          Enter a product SKU to find and edit its catalog information from your central database.
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
                    <Input placeholder="Enter product SKU..." {...field} disabled={isSearching} />
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
            {isSearching && <SearchSkeleton />}

            {error && !isSearching && (
                 <Alert variant="destructive">
                    <AlertTitle>Not Found</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {product && !isSearching && (
                <div className="mt-6 border-t pt-6">
                    <EditProductForm product={product} onSuccess={handleEditSuccess} connectedChannels={connectedChannels} />
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
