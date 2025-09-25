

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Trash2, Wand2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { handleUpdateProduct, handleOptimizeListing } from '@/app/actions';
import type { ShopifyProduct, ShopifyProductUpdate, ShopifyVariantUpdate } from '@/lib/types';
import { RichTextEditor } from './rich-text-editor';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from './ui/separator';
import Image from 'next/image';
import { Checkbox } from "@/components/ui/checkbox";


const platformIcons: { [key: string]: string } = {
  shopify: '/shopify.svg',
  amazon: '/amazon.svg',
  walmart: '/walmart.svg',
  etsy: '/etsy.svg',
  ebay: '/ebay.svg',
};

interface EditProductFormProps {
  product: ShopifyProduct;
  onSuccess?: () => void;
  connectedChannels: string[];
}

const variantSchema = z.object({
  id: z.number(),
  price: z.coerce.number().positive('Price must be a positive number.'),
  sku: z.string().optional(),
  inventory_quantity: z.coerce.number().int('Inventory must be a whole number.'),
});

const imageSchema = z.object({
  id: z.number().nullable(),
  src: z.string().url('Must be a valid URL.').or(z.literal('')),
});

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  body_html: z.string().min(10, 'Description must be at least 10 characters long.'),
  vendor: z.string().min(2, 'Vendor is required.'),
  product_type: z.string().min(2, 'Product type is required.'),
  tags: z.string().optional(),
  variants: z.array(variantSchema),
  images: z.array(imageSchema),
  marketplaces: z.array(z.string()).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

export function EditProductForm({ product, onSuccess, connectedChannels }: EditProductFormProps) {
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
      })),
      images: product.images.map(img => ({ id: img.id, src: img.src })),
      marketplaces: product.linked_to_platforms || ['shopify'],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'variants'
  });

   const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: 'images'
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
            price: v.price.toString(),
            sku: v.sku,
            inventory_quantity: v.inventory_quantity,
        })) as ShopifyVariantUpdate[],
        images: values.images.map(img => ({ id: img.id || undefined, src: img.src })).filter(img => img.src),
    };

    const result = await handleUpdateProduct(productData);

    if (result.success) {
      toast({
        title: 'Product Updated',
        description: `"${result.product?.title}" has been successfully updated and synced.`,
      });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/products');
        router.refresh();
      }
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
    <Card className="max-w-4xl mx-auto border-none shadow-none">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <CardTitle>Edit Product</CardTitle>
                <CardDescription>Update the details for "{product.title}".</CardDescription>
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

             {/* Images Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Images</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imageFields.map((field, index) => (
                      <div key={field.id} className="relative group">
                          <FormField
                            control={form.control}
                            name={`images.${index}.src`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                      <div>
                                        <div className="relative aspect-square w-full border rounded-md overflow-hidden">
                                          {field.value ? (
                                              <Image src={field.value} alt={`Product image ${index + 1}`} layout="fill" objectFit="cover" />
                                          ) : (
                                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                              </div>
                                          )}
                                        </div>
                                        <div className="relative mt-2">
                                          <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                          <Input {...field} placeholder="Image URL" className="pl-8 text-xs" />
                                        </div>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeImage(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendImage({ id: null, src: '' })}>
                    Add Image
                  </Button>
                </CardContent>
              </Card>
            </div>
            
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
            {/* Publishing Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Publishing</h3>
              <Card>
                 <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="marketplaces"
                      render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">Marketplaces</FormLabel>
                              <FormDescription>Select where this product should be listed.</FormDescription>
                            </div>
                            <div className="space-y-3">
                              {connectedChannels.map((id) => (
                                <FormField
                                  key={id}
                                  control={form.control}
                                  name="marketplaces"
                                  render={({ field }) => {
                                    const isShopify = id === 'shopify';
                                    return (
                                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={isShopify || field.value?.includes(id)}
                                            disabled={isShopify}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...(field.value || []), id])
                                                : field.onChange(field.value?.filter((value) => value !== id))
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal flex items-center gap-2">
                                          <Image src={platformIcons[id]} alt={id} width={16} height={16} unoptimized />
                                          {id.charAt(0).toUpperCase() + id.slice(1)}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                      )}
                    />
                 </CardContent>
              </Card>
            </div>


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

    