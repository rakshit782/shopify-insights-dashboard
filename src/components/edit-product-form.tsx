
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Trash2, Wand2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { handleUpdateProduct, handleOptimizeListing } from '@/app/actions';
import type { ShopifyProduct, ShopifyProductUpdate, ShopifyVariantUpdate } from '@/lib/types';
import { RichTextEditor } from './rich-text-editor';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface EditProductFormProps {
  product: ShopifyProduct;
}

const variantSchema = z.object({
  id: z.number(),
  price: z.coerce.number().positive('Price must be a positive number.'),
  sku: z.string().optional(),
  inventory_quantity: z.coerce.number().int('Inventory must be a whole number.'),
});

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  body_html: z.string().min(10, 'Description must be at least 10 characters long.'),
  vendor: z.string().min(2, 'Vendor is required.'),
  product_type: z.string().min(2, 'Product type is required.'),
  tags: z.string().optional(),
  variants: z.array(variantSchema),
});

type ProductFormValues = z.infer<typeof formSchema>;

export function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: product.title || '',
      body_html: product.body_html || '',
      vendor: product.vendor || '',
      product_type: product.product_type || '',
      tags: product.tags || '',
      variants: product.variants.map(v => ({
        id: v.id,
        price: parseFloat(v.price),
        sku: v.sku || '',
        inventory_quantity: v.inventory_quantity || 0,
      }))
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'variants'
  });

  const onOptimize = async () => {
    setIsOptimizing(true);
    toast({
        title: 'Optimizing Listing...',
        description: 'The AI is working its magic. This may take a moment.',
    });
    
    const currentValues = form.getValues();
    const result = await handleOptimizeListing({
        title: currentValues.title,
        description: currentValues.body_html,
        vendor: currentValues.vendor,
        productType: currentValues.product_type,
        tags: currentValues.tags,
    });

    if (result.success && result.data) {
        form.setValue('title', result.data.optimizedTitle, { shouldValidate: true });
        form.setValue('body_html', result.data.optimizedDescription, { shouldValidate: true });
        toast({
            title: 'Optimization Complete',
            description: 'The product title and description have been updated. Review the changes and save.',
        });
    } else {
        toast({
            title: 'Optimization Failed',
            description: result.error,
            variant: 'destructive',
        });
    }

    setIsOptimizing(false);
  };

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    
    const productData: ShopifyProductUpdate = {
        id: product.id,
        title: values.title,
        body_html: values.body_html,
        vendor: values.vendor,
        product_type: values.product_type,
        tags: values.tags,
        variants: values.variants.map(v => ({
            id: v.id,
            price: v.price.toString(), // Convert back to string for Shopify API
            sku: v.sku,
            inventory_quantity: v.inventory_quantity,
        })) as ShopifyVariantUpdate[],
    };

    const result = await handleUpdateProduct(productData);

    if (result.success) {
      toast({
        title: 'Product Updated',
        description: `"${result.product?.title}" has been successfully updated.`,
      });
      router.push('/cataloging-manager'); // Redirect to product list after successful update
      router.refresh(); // Force a refresh of the page data
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
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <CardTitle>Edit Product</CardTitle>
                <CardDescription>Update the details for "{product.title}". Changes will be saved to Shopify and your website.</CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={onOptimize} disabled={isOptimizing} className="w-full sm:w-auto">
                {isOptimizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Optimize with AI
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
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
            <Controller
              control={form.control}
              name="body_html"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <RichTextEditor value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Variants Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Variants</h3>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variant</TableHead>
                      <TableHead className="w-[150px]">Price</TableHead>
                      <TableHead className="w-[180px]">SKU</TableHead>
                      <TableHead className="w-[120px]">Inventory</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell className="font-medium">
                          {product.variants[index].title}
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`variants.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`variants.${index}.sku`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`variants.${index}.inventory_quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>

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
