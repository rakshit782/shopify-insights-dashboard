
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Search, Wand2, Save } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { handleGetProductBySku, handleOptimizeContent, handleUpdateProduct } from '@/app/actions';
import type { ShopifyProduct } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';

const searchSchema = z.object({
  sku: z.string().min(1, 'SKU is required.'),
});

type SearchFormValues = z.infer<typeof searchSchema>;
type Marketplace = 'google' | 'amazon' | 'walmart' | 'ebay' | 'etsy';

const optimizedContentSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  bulletPoints: z.array(z.object({ value: z.string() })),
});
type OptimizedContentValues = z.infer<typeof optimizedContentSchema>;


export function AiOptimizer() {
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarketplace, setSelectedMarketplace] = useState<Marketplace | null>(null);
  const { toast } = useToast();

  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { sku: '' },
  });

  const contentForm = useForm<OptimizedContentValues>({
    resolver: zodResolver(optimizedContentSchema),
    defaultValues: {
      title: '',
      description: '',
      bulletPoints: [],
    },
  });

  const { fields, replace, append } = useFieldArray({
    control: contentForm.control,
    name: 'bulletPoints',
  });

  const onSearch = async (values: SearchFormValues) => {
    setIsSearching(true);
    setError(null);
    setProduct(null);
    contentForm.reset();

    const result = await handleGetProductBySku(values.sku);

    if (result.product) {
      setProduct(result.product);
      contentForm.setValue('title', result.product.title);
      contentForm.setValue('description', result.product.body_html);
      // For simplicity, we are not loading bullet points from the main product here.
      // A more advanced version could parse them from the description.
      replace([{ value: '' }]); 
    } else {
      setError(result.error || 'Product with the specified SKU was not found.');
    }
    setIsSearching(false);
  };
  
  const onOptimize = async () => {
    if (!product || !selectedMarketplace) {
      toast({ title: 'Please select a marketplace first.', variant: 'destructive' });
      return;
    }
    setIsOptimizing(true);
    toast({
      title: `Optimizing for ${selectedMarketplace}...`,
      description: 'The AI is working its magic.',
    });

    const result = await handleOptimizeContent({
      marketplace: selectedMarketplace,
      title: product.title,
      description: product.body_html,
      bulletPoints: [], // Pass empty for now
    });
    
    if (result.success && result.data) {
        contentForm.setValue('title', result.data.optimizedTitle);
        contentForm.setValue('description', result.data.optimizedDescription);
        replace(result.data.optimizedBulletPoints.map(bp => ({ value: bp })));
        toast({ title: 'Optimization Complete!', description: 'Review the generated content below.' });
    } else {
        toast({ title: 'Optimization Failed', description: result.error, variant: 'destructive' });
    }

    setIsOptimizing(false);
  }

  const onSave = async (data: OptimizedContentValues) => {
    if (!product) return;
    setIsSaving(true);
    toast({ title: 'Saving changes...', description: 'Updating the product in Shopify and your database.' });

    // In a real app, you might want to convert bullet points to HTML and add to the description
    const newDescription = data.description;

    const result = await handleUpdateProduct({
        id: product.id,
        title: data.title,
        body_html: newDescription,
    });

    if (result.success) {
        toast({ title: 'Save Successful!', description: 'Product content has been updated.' });
        // Refresh product state
        onSearch({ sku: searchForm.getValues('sku') });
    } else {
        toast({ title: 'Save Failed', description: result.error, variant: 'destructive' });
    }

    setIsSaving(false);
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Content Optimizer</CardTitle>
        <CardDescription>
          Search for a product by SKU and use AI to optimize its content for different marketplaces.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...searchForm}>
          <form onSubmit={searchForm.handleSubmit(onSearch)} className="flex items-start gap-4">
            <FormField
              control={searchForm.control}
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
              {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Search
            </Button>
          </form>
        </Form>

        {isSearching && <Skeleton className="mt-8 h-48 w-full" />}

        {error && !isSearching && (
          <Alert variant="destructive" className="mt-8">
            <AlertTitle>Not Found</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {product && !isSearching && (
            <div className="mt-8 border-t pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-semibold">Editing Content for: <span className="text-primary">{product.title}</span></h3>
                        <p className="text-sm text-muted-foreground">SKU: {product.variants?.[0]?.sku}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select onValueChange={(value: Marketplace) => setSelectedMarketplace(value)} disabled={isOptimizing}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Marketplace" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="google">Google</SelectItem>
                                <SelectItem value="amazon">Amazon</SelectItem>
                                <SelectItem value="walmart">Walmart</SelectItem>
                                <SelectItem value="ebay">eBay</SelectItem>
                                <SelectItem value="etsy">Etsy</SelectItem>
                            </SelectContent>
                        </Select>
                         <Button onClick={onOptimize} disabled={isOptimizing || !selectedMarketplace}>
                            {isOptimizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Optimize
                        </Button>
                    </div>
                </div>

                <Separator className="mb-6"/>

                <Form {...contentForm}>
                    <form onSubmit={contentForm.handleSubmit(onSave)} className="space-y-6">
                        <FormField
                            control={contentForm.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Optimized Title</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={contentForm.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Optimized Description</FormLabel>
                                    <FormControl><Textarea {...field} rows={6} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div>
                           <FormLabel>Optimized Bullet Points</FormLabel>
                           <div className="mt-2 space-y-2">
                            {fields.map((field, index) => (
                                <FormField
                                    key={field.id}
                                    control={contentForm.control}
                                    name={`bulletPoints.${index}.value`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl><Input {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            ))}
                           </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSaving || isOptimizing}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
