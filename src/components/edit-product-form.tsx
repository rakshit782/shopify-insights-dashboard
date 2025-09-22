
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { handleUpdateProduct } from '@/app/actions';
import type { ShopifyProduct, ShopifyProductUpdate } from '@/lib/types';

interface EditProductFormProps {
  product: ShopifyProduct;
}

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  body_html: z.string().min(10, 'Description must be at least 10 characters long.'),
  vendor: z.string().min(2, 'Vendor is required.'),
  product_type: z.string().min(2, 'Product type is required.'),
  tags: z.string().optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

export function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: product.title || '',
      body_html: product.body_html || '',
      vendor: product.vendor || '',
      product_type: product.product_type || '',
      tags: product.tags || '',
    },
  });

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    
    const productData: ShopifyProductUpdate = {
        id: product.id,
        ...values,
    };

    const result = await handleUpdateProduct(productData);

    if (result.success) {
      toast({
        title: 'Product Updated',
        description: `"${result.product?.title}" has been successfully updated.`,
      });
      router.push('/'); // Redirect to dashboard after successful update
      router.refresh(); // Force a refresh of the dashboard page data
    } else {
      toast({
        title: 'Update Failed',
        description: result.error,
        variant: 'destructive',
      });
    }

    setIsSubmitting(false);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
            <CardDescription>Update the details for "{product.title}". Changes will be saved to Shopify and your website.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body_html"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (HTML)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={8} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="product_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (comma-separated)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end pt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
